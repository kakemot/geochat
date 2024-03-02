export function generateRandomName(): string {
    const words = [
        "able", "acid", "aged", "also", "area", "army", "away", "baby", "back", "ball",
        "band", "bank", "base", "bath", "bear", "beat", "been", "beer", "bell", "belt",
        "best", "bill", "bird", "blow", "blue", "boat", "body", "bomb", "bond", "bone",
        "book", "boom", "boot", "bore", "born", "boss", "both", "bowl", "bulk", "burn",
        "bush", "busy", "call", "calm", "came", "camp", "card", "care", "case", "cash",
        "cast", "cell", "chat", "chip", "city", "club", "coal", "coat", "code", "cold",
        "come", "cook", "cool", "cope", "copy", "core", "cost", "crew", "crop", "dark",
        "data", "date", "dawn", "days", "dead", "deal", "dean", "dear", "debt", "deep",
        "deny", "desk", "dial", "dick", "diet", "disc", "disk", "does", "done", "door",
        "dose", "down", "draw", "drew", "drop", "drug", "dual", "duck", "duly", "dust"
    ]
    
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
