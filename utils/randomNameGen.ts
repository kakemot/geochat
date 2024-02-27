export function generateRandomName(): string {
    const words = [
        "hest", "mann", "fisk", "orm", "leir", "katt", "hund", "båt", "fugl", "barn", "snø", "regn", "sol", "måne", "stjerne",
        "bok", "pen", "stor", "liten", "bred", "tynn", "glad", "sur", "søt", "salt", "kald", "varm", "våt", "tørr", "ny", 
        "gammel", "ung", "rask", "treg", "lys", "mørk", "høy", "lav", "dyr", "billig", "tom", "full", "hard", "myk", "skarp",
        "sløv", "ren", "skitten", "sterk", "svak", "tykk", "tynn", "lang", "kort", "bred", "smal", "flat", "dyp", "hvit", 
        "svart", "rød", "blå", "grønn", "gul", "rosa", "grå", "brun", "klar", "matt", "tett", "løs", "hel", "del", "før", 
        "etter", "over", "under", "med", "uten", "for", "mot", "til", "fra", "opp", "ned", "inn", "ut", "på", "av", "som",
        "enn", "men", "og", "eller", "når", "hvis", "da", "at", "et", "en", "den", "det", "flå", "klegg", "anon", "frykt", "båre", "hest", "redsel", "nrk", "bbc", "flere", "måne", "årsak"
    ];
    const firstWordIndex = Math.floor(Math.random() * words.length);
    let secondWordIndex = Math.floor(Math.random() * words.length);
    while (secondWordIndex === firstWordIndex) {
        secondWordIndex = Math.floor(Math.random() * words.length);
    }
    const firstWord = words[firstWordIndex];
    const secondWord = words[secondWordIndex];
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${firstWord.toLowerCase()}-${secondWord.toLowerCase()}-${randomNumber}`;
}
