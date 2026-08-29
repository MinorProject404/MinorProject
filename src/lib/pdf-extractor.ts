export async function extractTextFromFile(file: File): Promise<string> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return (await file.text()).trim();
  return extractTextFromPDF(file);
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib: any = await import("pdfjs-dist");
  const version = pdfjsLib.version ?? "5.4.149";
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText +=
      textContent.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ") + "\n\n";
  }

  const cleaned = fullText.replace(/[ \t]+/g, " ").trim();
  if (cleaned.length < 50) {
    throw new Error(
      "We couldn't read any text from this PDF. It may be a scanned image — try a text-based PDF or paste the text instead.",
    );
  }
  return cleaned;
}