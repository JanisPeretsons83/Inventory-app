const LABEL_AI_PROMPT = `
You are reading a standardized wooden pallet inventory label.

Extract ONLY the required inventory values described below.

LABEL LAYOUT:

1. DIMENSION
   Find the field labeled "Dimensija".
   It is located in the middle-left part of the label.

   The handwritten value represents:

   thickness × width × length

   Example:
   27x95x4200

   Return:
   thickness = 27
   width = 95
   length = 4200


2. PIECES
   Find the field labeled "GB:".
   It is located to the right of the "Dimensija" field.

   This handwritten number is the number of pieces
   in the pallet.

   Example:
   GB: 600

   Return:
   pieces = 600


3. MONTH AND YEAR
   Find the field labeled "Datums:".
   It is located in the upper-right part of the label.

   The year may already be printed after "Datums:".
   Example:
   Datums: 2026

   Return the full four-digit year:
   year = 2026

   A handwritten date or month may also be present
   in this field.

   If a date is written as:
   27.08
   return:
   month = 8

   If only the month is written, return that month.


IGNORE COMPLETELY:

- V. Uzvārds
- Nākošā operācija
- m3
- Detaļas Nr.
- other text
- barcode
- number printed below the barcode
- large identification number at the bottom of the label

IMPORTANT:

The large number at the bottom of the label and the
barcode number are NOT inventory dimensions, pieces,
month or year.

Never use them for the requested fields.

Do NOT guess missing or unclear digits.

If a required value cannot be read reliably,
return null for that field.

Return ONLY valid JSON in exactly this structure:

{
    "thickness": null,
    "width": null,
    "length": null,
    "pieces": null,
    "month": null,
    "year": null
}
`;
