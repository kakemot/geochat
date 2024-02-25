export function generateRandomName(minLength: number = 2, maxLength: number = 3): string {
    const words = [
        "hest", "mann", "fisk", "orm", "leir", "katt", "hund", "båt", "fugl", "barn", "snø", "regn", "sol", "måne", "stjerne",
        "bok", "pen", "stor", "liten", "bred", "tynn", "glad", "sur", "søt", "salt", "kald", "varm", "våt", "tørr", "ny", 
        "gammel", "ung", "rask", "treg", "lys", "mørk", "høy", "lav", "dyr", "billig", "tom", "full", "hard", "myk", "skarp",
        "sløv", "ren", "skitten", "sterk", "svak", "tykk", "tynn", "lang", "kort", "bred", "smal", "flat", "dyp", "hvit", 
        "svart", "rød", "blå", "grønn", "gul", "rosa", "grå", "brun", "klar", "matt", "tett", "løs", "hel", "del", "før", 
        "etter", "over", "under", "med", "uten", "for", "mot", "til", "fra", "opp", "ned", "inn", "ut", "på", "av", "som",
        "enn", "men", "og", "eller", "når", "hvis", "da", "at", "et", "en", "den", "det"
    ];    const numberOfWords = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let name = '';
    for (let i = 0; i < numberOfWords; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        name += words[randomIndex].toLowerCase() + '-';
    }
    return name.slice(0, -1);
}