from typing import Dict, List
import io, pandas as pd
import numpy as np
from app.models.header_model import get_all_headers
from datetime import date
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import unicodedata

# Map frontend types to internal Python-friendly types
TYPE_MAP = {
    "str": "string",
    "string": "string",  # Added this mapping
    "int": "integer", 
    "integer": "integer",  # Added this mapping
    "number": "float",  # Added this mapping for your "number" type
    "float": "float",
    "date": "date",
    "boolean": "boolean",
    "bool": "boolean",  # Added this mapping
    "email": "email",
    "phone": "integer",
    "url": "url", 
    "text": "string",
    "json": "json"
}
# Get data type in a user-friendly format
def get_user_friendly_dtype(dtype):
    dtype_str = str(dtype)
    if 'int' in dtype_str:
        return 'Number (Integer)'
    elif 'float' in dtype_str:
        return 'Number (Decimal)'
    elif 'object' in dtype_str:
        return 'Text'
    elif 'datetime' in dtype_str:
        return 'Date/Time'
    elif 'bool' in dtype_str:
        return 'True/False'
    else:
        return 'Unknown'

# Safe conversion to float
def safe_float(value, default=0.0):
    try:
        if pd.isna(value) or value == '' or value is None:
            return default
        return float(value)
    except (ValueError, TypeError):
        return default

# Safe round function that handles NaN and infinity
def safe_round(value, decimals=2):
    try:
        if pd.isna(value):
            return 0.0
        float_val = float(value)
        if np.isinf(float_val):
            return 0.0
        return round(float_val, decimals)
    except (ValueError, TypeError):
        return 0.0

# Check if a value is numeric and potentially problematic for JSON
def is_problematic_numeric(value):
    try:
        if pd.isna(value):
            return True
        if isinstance(value, (int, float, np.integer, np.floating)):
            float_val = float(value)
            return np.isnan(float_val) or np.isinf(float_val)
        return False
    except (ValueError, TypeError):
        return False


# Convert DataFrame to JSON-safe format
def dataframe_to_json_safe(df):
    try:
        # Create a copy to avoid modifying original
        df_clean = df.copy()
        
        # Process each column based on its data type
        for col in df_clean.columns:
            col_dtype = df_clean[col].dtype
            
            if pd.api.types.is_numeric_dtype(col_dtype):
                # Handle numeric columns
                # Replace inf and -inf with 0
                df_clean[col] = df_clean[col].replace([np.inf, -np.inf], 0)
                # Fill NaN with 0
                df_clean[col] = df_clean[col].fillna(0)
            else:
                # Handle non-numeric columns (text, dates, etc.)
                # Fill NaN with empty string for object types
                if col_dtype == 'object':
                    df_clean[col] = df_clean[col].fillna('')
                else:
                    df_clean[col] = df_clean[col].fillna(0)
        
        # Convert to records
        records = df_clean.to_dict(orient="records")
        
        # Final safety check - clean each record
        clean_records = []
        for record in records:
            clean_record = {}
            for key, value in record.items():
                try:
                    # Handle different value types
                    if pd.isna(value):
                        clean_record[key] = 0 if isinstance(value, (int, float, np.integer, np.floating)) else ""
                    elif isinstance(value, (np.integer, np.floating)):
                        # Convert numpy types to Python types
                        float_val = float(value)
                        if np.isnan(float_val) or np.isinf(float_val):
                            clean_record[key] = 0
                        else:
                            clean_record[key] = float_val if isinstance(value, np.floating) else int(value)
                    elif isinstance(value, (int, float)):
                        # Handle Python numeric types
                        if np.isnan(value) or np.isinf(value):
                            clean_record[key] = 0
                        else:
                            clean_record[key] = value
                    else:
                        # Handle strings and other types
                        clean_record[key] = str(value) if value is not None else ""
                except (ValueError, TypeError, OverflowError):
                    # If any conversion fails, use safe default
                    clean_record[key] = ""
            
            clean_records.append(clean_record)
        
        return clean_records
        
    except Exception as e:
        print(f"Error in dataframe_to_json_safe: {str(e)}")
        # Fallback: return empty list if conversion fails completely
        return []

def generate_manual_review_summary(manual_rows: List[Dict]) -> str:
    summary_lines = ["The following cells need manual review:\n"]

    for i, row in enumerate(manual_rows):
        # Identify only problematic fields
        not_found_fields = [
            k for k, v in row.items()
            if str(v).strip().lower() == "not found"
        ]
        if not_found_fields:
            # Join with " or " for natural language
            joined_fields = " or ".join(not_found_fields)
            summary_lines.append(
                f"Row {i + 2}: The VAT Rate and Shipping VAT Rate for this row could not be found. This row requires manual review and recalculation.\n"
            )

    if len(summary_lines) == 1:
        return "No cells require manual review."

    return "\n".join(summary_lines)

async def rename_columns_with_labels(df: pd.DataFrame) -> pd.DataFrame:
    all_headers = await get_all_headers()
    
    header_labels = {header['value']: header['label'] for header in all_headers}

    rename_map = {}
    for col in df.columns:
        if col in header_labels:
            rename_map[col] = header_labels[col]
            print(f"Will rename column '{col}' to '{header_labels[col]}'")

    if rename_map:
        df = df.rename(columns=rename_map)
    else:
        print("No columns found that match header values for renaming")

    return df

def get_quarter(date: date) -> str:
    month = date.month
    if month <= 3:
        return "Q1"
    elif month <= 6:
        return "Q2"
    elif month <= 9:
        return "Q3"
    else:
        return "Q4"
    

def validate_order_date(order_date: date, current_date: date) -> str:
    file_quarter = get_quarter(order_date)
    system_quarter = get_quarter(current_date)

    file_q_index = order_date.year * 4 + int(file_quarter[1])
    system_q_index = current_date.year * 4 + int(system_quarter[1])

    if file_q_index == system_q_index - 1:
        return "Accepted: Order date is valid for the previous quarter."
    elif file_q_index == system_q_index:
        return "Rejected: Order date is in the current quarter, not allowed."
    elif file_q_index < system_q_index - 1:
        return "Rejected: Order date is too old, must be within the last quarter."
    else:
        return "Rejected: Order date is in the future, not allowed."

def dataframe_to_pdf(df: pd.DataFrame, pdf_stream: io.BytesIO, title: str):
    """
    Generate a professional, print-ready VAT Report PDF (A4 landscape)
    with all data right-aligned and headers centered.
    Ensures words are not split mid-word in headers (e.g., 'Country' won't become 'Coun\ntry').
    """

    # --- Setup document ---
    doc = SimpleDocTemplate(
        pdf_stream,
        pagesize=landscape(A4),
        leftMargin=30,
        rightMargin=30,
        topMargin=30,
        bottomMargin=30,
    )

    styles = getSampleStyleSheet()

    # --- Title style ---
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=14,
        alignment=1,  # Center
        spaceAfter=12,
    )

    # --- Header style (centered, no breaking inside single words) ---
    header_style = ParagraphStyle(
        "HeaderStyle",
        fontName="Helvetica-Bold",
        fontSize=8,
        alignment=1,  # Center
        leading=10,
        wordWrap="None",  # allow wrap only between words
    )

    # --- Cell style (right aligned) ---
    cell_style = ParagraphStyle(
        "CellStyle",
        fontName="Helvetica",
        fontSize=7,
        alignment=2,  # Right align
        leading=9,
        wordWrap="None",
    )

    # --- Build title ---
    elements = [Paragraph(title, title_style), Spacer(1, 8)]

    # --- Prepare Data ---
    df = df.fillna("")

    # Create header row (no splitting inside single words)
    header_row = [
        Paragraph(" ".join(col.split()), header_style)
        for col in df.columns
    ]

    # Create data rows
    data_rows = [
        [Paragraph(str(cell), cell_style) for cell in row]
        for row in df.astype(str).values.tolist()
    ]

    data = [header_row] + data_rows

    # --- Calculate proportional column widths ---
    page_width, _ = landscape(A4)
    usable_width = page_width - doc.leftMargin - doc.rightMargin

    avg_lengths = [
        max(len(str(col)), int(df[col].astype(str).str.len().mean() or 5))
        for col in df.columns
    ]
    total_len = sum(avg_lengths)
    col_widths = [usable_width * (l / total_len) for l in avg_lengths]

    # Limit column sizes (ensure no narrow columns that force word breaks)
    min_w, max_w = 70, 120
    col_widths = [max(min_w, min(w, max_w)) for w in col_widths]

    if "Order Date" in df.columns:
        idx = list(df.columns).index("Order Date")
        col_widths[idx] = max(col_widths[idx], 80)

    # Normalize to fit exactly within usable width
    scale = usable_width / sum(col_widths)
    col_widths = [w * scale for w in col_widths]

    # --- Build Table ---
    table = Table(data, colWidths=col_widths, repeatRows=1)

    table.setStyle(TableStyle([
        # Header formatting
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, colors.black),

        # Data cells formatting
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("ALIGN", (0, 1), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 1), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 1), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 3.5),

        # Grid lines
        ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
    ]))

    elements.append(table)

    # --- Build PDF ---
    doc.build(elements)
    pdf_stream.seek(0)
    return pdf_stream.getvalue()


def normalize_string(value: str) -> str:
    """
    Normalize strings to handle platform-specific encoding issues (Mac/iPhone vs Windows/Android).
    - Removes all Unicode whitespace characters (including non-breaking spaces)
    - Converts to lowercase
    - Removes accents and diacritics
    - Removes any control characters
    """
    if not isinstance(value, str):
        return ""
    
    # Replace all Unicode whitespace with regular spaces, then strip
    value = ''.join(c if not c.isspace() else ' ' for c in value)
    value = ' '.join(value.split())  # Normalize multiple spaces to single space
    
    # Convert to NFD (decomposed) form and remove combining marks (accents)
    value = unicodedata.normalize('NFD', value)
    value = ''.join(c for c in value if unicodedata.category(c) != 'Mn')
    
    # Convert to lowercase
    value = value.lower().strip()
    
    return value
