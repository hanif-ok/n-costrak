const formatterAngka = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatterRupiah = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatAngka(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined || isNaN(nilai)) return '\u2014';
  return formatterAngka.format(nilai);
}

export function formatJutaRupiah(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined || isNaN(nilai)) return '\u2014';
  return `Rp${formatterRupiah.format(nilai)} jt`;
}

export function formatPersen(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined || isNaN(nilai)) return '\u2014';
  return `${formatterAngka.format(nilai)}%`;
}

export function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function parseAngkaInput(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
