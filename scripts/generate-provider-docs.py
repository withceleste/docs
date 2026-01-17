#!/usr/bin/env python3
"""Generate provider documentation pages from the Celeste model registry.

This script keeps docs/content/docs/providers in sync with the source-of-truth
Celeste registry (celeste.list_models()).

Design goals:
- Avoid documentation drift: model lists and providers nav are generated.
- Preserve manual prose: only the models block is rewritten (marker-based).
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path


# MDX does not support HTML comments (`<!-- -->`) because it treats them as JSX-like tags.
# Use MDX-safe JSX comments instead.
MODELS_START_MARKER = "{/* AUTO-GENERATED:MODELS:START */}"
MODELS_END_MARKER = "{/* AUTO-GENERATED:MODELS:END */}"

# Backward compatibility: migrate legacy HTML markers created by earlier versions of this script.
LEGACY_MODELS_START_MARKER = "<!-- AUTO-GENERATED:MODELS:START -->"
LEGACY_MODELS_END_MARKER = "<!-- AUTO-GENERATED:MODELS:END -->"

SUPPORTED_PROVIDERS_START_MARKER = "{/* AUTO-GENERATED:SUPPORTED_PROVIDERS:START */}"
SUPPORTED_PROVIDERS_END_MARKER = "{/* AUTO-GENERATED:SUPPORTED_PROVIDERS:END */}"


@dataclass(frozen=True)
class ProviderPageInput:
    provider: object
    slug: str
    title: str
    description: str
    logo_slug: str | None


def _docs_root() -> Path:
    # docs/scripts/generate-provider-docs.py -> docs/
    return Path(__file__).resolve().parents[1]


def _providers_dir(docs_root: Path) -> Path:
    return docs_root / "content" / "docs" / "providers"

def _index_page_path(docs_root: Path) -> Path:
    return docs_root / "content" / "docs" / "index.mdx"


def _logos_dir(docs_root: Path) -> Path:
    return docs_root / "public" / "logos"


def _provider_title(provider: object) -> str:
    """Human-friendly provider name from Provider StrEnum (with a few casing exceptions)."""
    from celeste.core import Provider  # type: ignore

    mapping: dict[Provider, str] = {
        Provider.OPENAI: "OpenAI",
        Provider.XAI: "xAI",
        Provider.BYTEPLUS: "BytePlus",
        Provider.ELEVENLABS: "ElevenLabs",
        Provider.STABILITYAI: "StabilityAI",
        Provider.TOPAZLABS: "TopazLabs",
        Provider.DEEPSEEK: "DeepSeek",
        Provider.HUGGINGFACE: "HuggingFace",
        Provider.BFL: "Black Forest Labs",
    }

    if isinstance(provider, Provider) and provider in mapping:
        return mapping[provider]

    provider_slug = getattr(provider, "value", str(provider))
    return provider_slug.replace("-", " ").title()


def _provider_logo_slug(provider: object) -> str | None:
    # Docs currently have bytedance.svg; Celeste provider slug is byteplus.
    provider_slug = getattr(provider, "value", str(provider))
    if provider_slug == "byteplus":
        return "bytedance"
    return provider_slug


def _build_provider_page_input(provider: object, docs_root: Path) -> ProviderPageInput:
    provider_slug = getattr(provider, "value", str(provider))
    title = _provider_title(provider)
    description = f"Documentation for the {title} provider."

    candidate_logo_slug = _provider_logo_slug(provider)
    if candidate_logo_slug is None:
        return ProviderPageInput(
            provider=provider,
            slug=provider_slug,
            title=title,
            description=description,
            logo_slug=None,
        )

    logo_path = _logos_dir(docs_root) / f"{candidate_logo_slug}.svg"
    logo_slug = candidate_logo_slug if logo_path.exists() else None

    return ProviderPageInput(
        provider=provider,
        slug=provider_slug,
        title=title,
        description=description,
        logo_slug=logo_slug,
    )


def _render_supported_providers_block(providers: list[ProviderPageInput]) -> str:
    # For logos that are mostly monochrome, invert in dark mode.
    dark_invert_logo_slugs = {"anthropic", "openai", "xai", "elevenlabs", "bfl", "groq"}

    lines: list[str] = []
    lines.append('<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-6 not-prose">')

    for provider in providers:
        card_parts: list[str] = []
        card_parts.append(
            f'  <a href="/providers/{provider.slug}" className="flex items-center gap-2 p-2 border rounded-lg no-underline hover:bg-fd-accent/50 transition-colors">'
        )

        if provider.logo_slug is not None:
            logo_classes = "h-5 w-5 shrink-0"
            if provider.logo_slug in dark_invert_logo_slugs:
                logo_classes += " dark:invert"
            card_parts.append(
                f'    <img src="/logos/{provider.logo_slug}.svg" width="20" height="20" alt="" aria-hidden="true" className="{logo_classes}" />'
            )

        card_parts.append(f"    <span>{provider.title}</span>")
        card_parts.append("  </a>")
        lines.extend(card_parts)

    lines.append("</div>")
    return "\n".join(lines).strip() + "\n"


def _replace_supported_providers_region(page_text: str, block: str) -> str:
    pattern = re.compile(
        rf"(?s){re.escape(SUPPORTED_PROVIDERS_START_MARKER)}.*?{re.escape(SUPPORTED_PROVIDERS_END_MARKER)}"
    )
    replacement = (
        f"{SUPPORTED_PROVIDERS_START_MARKER}\n\n"
        f"{block.rstrip()}\n\n"
        f"{SUPPORTED_PROVIDERS_END_MARKER}"
    )

    if not pattern.search(page_text):
        msg = (
            "Supported Providers markers not found in docs/content/docs/index.mdx. "
            "Add the markers so the section can be auto-generated."
        )
        raise ValueError(msg)

    return pattern.sub(replacement, page_text, count=1)


def _ensure_supported_providers_index_section(
    *,
    docs_root: Path,
    providers: list[ProviderPageInput],
) -> None:
    index_path = _index_page_path(docs_root)
    if not index_path.exists():
        return

    existing = index_path.read_text(encoding="utf-8")
    updated = _replace_supported_providers_region(
        existing, _render_supported_providers_block(providers)
    )
    index_path.write_text(updated.rstrip() + "\n", encoding="utf-8")


def _format_supported_ops_cell(ops_by_modality: dict[str, set[str]]) -> str:
    parts: list[str] = []
    for modality in sorted(ops_by_modality.keys()):
        for operation in sorted(ops_by_modality[modality]):
            parts.append(f"`{modality}.{operation}`")
    return ", ".join(parts) if parts else "-"


def _render_models_table(models: list[object]) -> str:
    """Render a models list as a markdown table (legacy)."""
    lines: list[str] = []
    lines.append("| Model ID | Display name | Supports (modality.operation) | Streaming |")
    lines.append("| :--- | :--- | :--- | :--- |")

    for model in sorted(
        models,
        key=lambda m: (getattr(m, "display_name"), getattr(m, "id")),
    ):
        model_id = getattr(model, "id")
        display_name = getattr(model, "display_name")
        streaming = "Yes" if bool(getattr(model, "streaming", False)) else "No"

        ops_by_modality: dict[str, set[str]] = {}
        operations = getattr(model, "operations", {}) or {}
        for modality, ops in operations.items():
            modality_value = getattr(modality, "value", str(modality))
            ops_values = {getattr(op, "value", str(op)) for op in (ops or set())}
            if ops_values:
                ops_by_modality.setdefault(modality_value, set()).update(ops_values)

        supports_cell = _format_supported_ops_cell(ops_by_modality)

        lines.append(
            f"| `{model_id}` | {display_name} | {supports_cell} | {streaming} |"
        )

    return "\n".join(lines).strip() + "\n"


def _collect_ops_by_modality(models: list[object]) -> dict[str, set[str]]:
    ops_by_modality: dict[str, set[str]] = {}
    for model in models:
        operations = getattr(model, "operations", {}) or {}
        for modality, ops in operations.items():
            modality_value = getattr(modality, "value", str(modality))
            ops_values = {getattr(op, "value", str(op)) for op in (ops or set())}
            if ops_values:
                ops_by_modality.setdefault(modality_value, set()).update(ops_values)
    return ops_by_modality


def _collect_models_by_modality(models: list[object]) -> dict[str, list[object]]:
    models_by_modality: dict[str, list[object]] = {}
    for model in models:
        operations = getattr(model, "operations", {}) or {}
        for modality, ops in operations.items():
            modality_value = getattr(modality, "value", str(modality))
            ops_values = {getattr(op, "value", str(op)) for op in (ops or set())}
            if ops_values:
                models_by_modality.setdefault(modality_value, []).append(model)
    return models_by_modality


def _render_available_modalities(models: list[object]) -> str:
    """Render a provider-level modalities summary (union of ops across models)."""
    ops_by_modality: dict[str, set[str]] = {}
    ops_by_modality = _collect_ops_by_modality(models)

    if not ops_by_modality:
        return ""

    lines: list[str] = []
    lines.append("Available modalities:")
    lines.append("")
    for modality in sorted(ops_by_modality.keys()):
        ops = ", ".join(f"`{op}`" for op in sorted(ops_by_modality[modality]))
        lines.append(f"- `{modality}`: {ops}")
    return "\n".join(lines).strip()


def _modality_title(modality: str) -> str:
    mapping = {
        "text": "Text",
        "images": "Images",
        "audio": "Audio",
        "videos": "Videos",
        "embeddings": "Embeddings",
    }
    return mapping.get(modality, modality.replace("-", " ").title())


def _format_operations_list(ops: set[str]) -> str:
    return ", ".join(f"`{op}`" for op in sorted(ops)) if ops else "-"


def _render_models_table_for_modality(models: list[object], modality: str) -> str:
    lines: list[str] = []
    lines.append("| Model ID | Display name | Operations | Streaming |")
    lines.append("| :--- | :--- | :--- | :--- |")

    rows: list[tuple[str, str, str, str]] = []
    for model in models:
        operations = getattr(model, "operations", {}) or {}
        ops_set: set[str] = set()
        for mod, ops in operations.items():
            mod_value = getattr(mod, "value", str(mod))
            if mod_value != modality:
                continue
            ops_set = {getattr(op, "value", str(op)) for op in (ops or set())}
            break

        if not ops_set:
            continue

        model_id = getattr(model, "id")
        display_name = getattr(model, "display_name")
        streaming = "Yes" if bool(getattr(model, "streaming", False)) else "No"
        rows.append((display_name, model_id, _format_operations_list(ops_set), streaming))

    for display_name, model_id, ops_cell, streaming in sorted(rows):
        lines.append(f"| `{model_id}` | {display_name} | {ops_cell} | {streaming} |")

    return "\n".join(lines).strip() + "\n"


def _render_models_block(models: list[object]) -> str:
    """Render the full auto-generated content inserted between the models markers."""
    parts: list[str] = []
    parts.append("This section is auto-generated from the Celeste registry. Do not edit manually.")

    summary = _render_available_modalities(models)
    if summary:
        parts.append("")
        parts.append(summary)

    models_by_modality = _collect_models_by_modality(models)
    modality_order = ["text", "images", "audio", "videos", "embeddings"]
    extra_modalities = sorted(set(models_by_modality.keys()) - set(modality_order))
    ordered_modalities = [m for m in modality_order if m in models_by_modality] + extra_modalities

    for modality in ordered_modalities:
        parts.append("")
        parts.append(f"### {_modality_title(modality)}")
        parts.append("")
        parts.append(_render_models_table_for_modality(models_by_modality[modality], modality).strip())

    return "\n".join(parts).strip() + "\n"


def _render_credentials(provider: object) -> str:
    """Render the credential guidance for a provider (env var or auth class)."""
    try:
        from celeste.credentials import get_auth_config  # type: ignore
        from celeste.exceptions import UnsupportedProviderError  # type: ignore
    except ImportError:
        return "See the Celeste authentication guide for provider-specific credential setup."

    try:
        auth_config = get_auth_config(provider)
    except UnsupportedProviderError:
        return "See the Celeste authentication guide for provider-specific credential setup."

    if isinstance(auth_config, tuple):
        secret_name, _header, _prefix = auth_config
        return "\n".join(
            [
                f"Set the `{secret_name}` environment variable.",
                "",
                "```bash",
                f'export {secret_name}="..."',
                "```",
            ]
        )

    # Auth config is a class (ADC/OAuth/custom auth), so there is no API key env var.
    auth_class = auth_config
    auth_name = getattr(auth_class, "__name__", "Authentication")
    return f"This provider uses `{auth_name}` authentication (no API key required)."


def _render_models_section(models: list[object]) -> str:
    block = _render_models_block(models)
    return (
        "## Models\n\n"
        f"{MODELS_START_MARKER}\n\n"
        f"{block}\n"
        f"{MODELS_END_MARKER}\n"
    )


def _strip_legacy_models_lists(page_text: str) -> str:
    # Replace legacy manually-maintained bullet lists under "### Models" headings.
    #
    # Example:
    # ### Models
    # - `gpt-4o`
    # - `gpt-4o-mini`
    #
    # becomes:
    # ### Models
    #
    # (See the auto-generated **Models** section below.)
    #
    pattern = re.compile(r"(?ms)^### Models\\s*\\n(?:\\s*\\n)*(?:- .*(?:\\n|$))+")

    def repl(_: re.Match[str]) -> str:
        return "### Models\n\n(See the auto-generated **Models** section below.)\n\n"

    return pattern.sub(repl, page_text)


def _normalize_models_markers(page_text: str) -> str:
    """Normalize legacy HTML markers to MDX-safe markers."""
    if LEGACY_MODELS_START_MARKER not in page_text and LEGACY_MODELS_END_MARKER not in page_text:
        return page_text
    return (
        page_text.replace(LEGACY_MODELS_START_MARKER, MODELS_START_MARKER).replace(
            LEGACY_MODELS_END_MARKER, MODELS_END_MARKER
        )
    )


def _replace_models_region(page_text: str, models_table: str) -> str:
    """Replace the content between MODELS_START_MARKER and MODELS_END_MARKER."""
    start = page_text.index(MODELS_START_MARKER) + len(MODELS_START_MARKER)
    end = page_text.index(MODELS_END_MARKER)
    return page_text[:start] + "\n\n" + models_table.strip() + "\n" + page_text[end:]


def _ensure_provider_page(
    *,
    provider: ProviderPageInput,
    models: list[object],
    providers_dir: Path,
) -> None:
    target = providers_dir / f"{provider.slug}.mdx"
    models_section = _render_models_section(models)
    models_block = _render_models_block(models)

    if target.exists():
        existing = _normalize_models_markers(target.read_text(encoding="utf-8"))

        updated = existing
        if MODELS_START_MARKER in existing and MODELS_END_MARKER in existing:
            updated = _replace_models_region(existing, models_block)
        else:
            # First-time migration of a manually-written page.
            updated = _strip_legacy_models_lists(existing).rstrip() + "\n\n" + models_section

        target.write_text(updated.rstrip() + "\n", encoding="utf-8")
        return

    # Create a new provider page.
    logo_block = ""
    if provider.logo_slug is not None:
        logo_block = (
            f'<img src="/logos/{provider.logo_slug}.svg" width="64" height="64" '
            f'alt="{provider.title}" className="mb-6 dark:invert" />\n\n'
        )

    new_page = (
        "---\n"
        f"title: {provider.title}\n"
        f"description: {provider.description}\n"
        "---\n\n"
        f"{logo_block}"
        f"Celeste supports the **{provider.title}** provider.\n\n"
        "## Credentials\n\n"
        f"{_render_credentials(provider.provider)}\n\n"
        f"{models_section}\n"
        "## Notes\n\n"
        "_Add provider-specific tips, caveats, and examples here._\n"
    )

    target.write_text(new_page.rstrip() + "\n", encoding="utf-8")


def main() -> None:
    # Import Celeste lazily so this script can be invoked via `uv run` easily.
    from celeste import list_models  # type: ignore

    docs_root = _docs_root()
    providers_dir = _providers_dir(docs_root)
    providers_dir.mkdir(parents=True, exist_ok=True)

    all_models = list_models()

    # Group models by provider (Provider StrEnum from Celeste).
    providers_to_models: dict[object, list[object]] = {}
    for model in all_models:
        provider = getattr(model, "provider")
        providers_to_models.setdefault(provider, []).append(model)

    # Create/update provider pages.
    for provider, provider_models in sorted(
        providers_to_models.items(),
        key=lambda item: getattr(item[0], "value", str(item[0])),
    ):
        provider_input = _build_provider_page_input(provider, docs_root)
        _ensure_provider_page(
            provider=provider_input,
            models=provider_models,
            providers_dir=providers_dir,
        )

    # Generate providers meta.json for sidebar navigation.
    meta_path = providers_dir / "meta.json"
    providers_pages = [
        getattr(provider, "value", str(provider))
        for provider in sorted(
            providers_to_models.keys(),
            key=lambda p: getattr(p, "value", str(p)),
        )
    ]
    meta = {"title": "Providers", "pages": providers_pages}
    meta_path.write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")

    # Keep the home page "Supported Providers" section in sync.
    index_providers = [
        _build_provider_page_input(provider, docs_root)
        for provider in sorted(
            providers_to_models.keys(),
            key=lambda p: getattr(p, "value", str(p)),
        )
    ]
    _ensure_supported_providers_index_section(docs_root=docs_root, providers=index_providers)


if __name__ == "__main__":
    main()

