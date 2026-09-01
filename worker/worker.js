// ======================================================
// 🤖 INVENTORY LABEL AI WORKER
// ======================================================


// ======================================================
// 📋 AI INSTRUKCIJA
// ======================================================

const LABEL_AI_PROMPT = `
You are reading a standardized wooden pallet inventory label.

Extract ONLY the following inventory values:

1. thickness
2. width
3. length
4. pieces
5. month
6. year


LABEL STRUCTURE:

DIMENSION
---------

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


PIECES
------

Find the field labeled "GB:".

It is located to the right of the "Dimensija" field.

The handwritten number in this field represents
the number of pieces in the pallet.

Example:

GB: 600

Return:

pieces = 600


DATE
----

Find the field labeled "Datums:".

It is located in the upper-right part of the label.

The year may already be printed on the label.

Example:

Datums: 2026

Return:

year = 2026


A handwritten date may also be present.

Example:

27.08

Return ONLY the month:

month = 8


IGNORE COMPLETELY:

- V. Uzvārds
- Nākošā operācija
- m3
- Detaļas Nr.
- barcode
- barcode number
- large identification number at the bottom
- all other unrelated text and numbers


IMPORTANT:

Never use the barcode or the large identification
number at the bottom as inventory data.

Do NOT guess unclear or missing digits.

If a value cannot be read reliably,
return null for that field.


Return ONLY valid JSON:

{
    "thickness": null,
    "width": null,
    "length": null,
    "pieces": null,
    "month": null,
    "year": null
}
`;


// ======================================================
// 🌐 CLOUDFLARE WORKER
// ======================================================
//
// ŠO DAĻU IZVEIDOSIM VĒLĀK.
//
// Worker saņems attēlu no ai-test.js,
// nosūtīs attēlu + LABEL_AI_PROMPT AI,
// un atgriezīs JSON.
//
// ======================================================
