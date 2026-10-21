// Typographie française : la ponctuation haute (: ; ! ?) et les guillemets ne
// doivent jamais se retrouver seuls en début de ligne. On remplace l'espace qui
// les sépare du mot par une espace insécable.
export function frenchSpacing(text: string): string {
  return text
    .replace(/« /g, "« ")
    .replace(/ »/g, " »")
    .replace(/ ([:;!?])/g, " $1");
}
