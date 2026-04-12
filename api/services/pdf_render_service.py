"""
PDF Render Service — renders Jinja2 HTML templates to PDF via WeasyPrint.

Thin layer: loads templates, registers helper functions, renders to bytes.
All data gathering happens in pdf_data_service.
"""

from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"


def _format_currency(value) -> str:
    """Format number as currency: $1,234.56"""
    if value is None:
        return "$0.00"
    n = float(value)
    if n < 0:
        return f"-${abs(n):,.2f}"
    return f"${n:,.2f}"


def _format_pct(value) -> str:
    """Format number as percentage: 37.8%"""
    if value is None:
        return "0.0%"
    return f"{float(value):.1f}%"


def _format_date(value) -> str:
    """Format date string: 2026-04-07 → April 7, 2026"""
    if not value:
        return "—"
    try:
        if isinstance(value, str):
            d = datetime.strptime(value[:10], "%Y-%m-%d")
        else:
            d = value
        return d.strftime("%B %-d, %Y")
    except (ValueError, TypeError):
        return str(value)


def _format_signed(value) -> str:
    """Format number with explicit sign: +$1,234 or -$1,234"""
    if value is None:
        return "$0.00"
    n = float(value)
    if n >= 0:
        return f"+${n:,.2f}"
    return f"-${abs(n):,.2f}"


def _get_env() -> Environment:
    env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))
    env.globals["format_currency"] = _format_currency
    env.globals["format_pct"] = _format_pct
    env.globals["format_date"] = _format_date
    env.globals["format_signed"] = _format_signed
    return env


def render_pdf(template_name: str, data: dict, detailed: bool = False) -> bytes:
    """
    Render an HTML template with data and convert to PDF bytes.

    Args:
        template_name: Template filename (e.g. 'estimate_client.html')
        data: Dict of template variables
        detailed: Whether to show line-item detail (for client estimates)

    Returns:
        PDF file contents as bytes
    """
    env = _get_env()
    template = env.get_template(template_name)

    # Merge data dict + detailed flag into template context
    context = {**data, "detailed": detailed}
    html = template.render(**context)

    return HTML(string=html, base_url=str(TEMPLATES_DIR)).write_pdf()
