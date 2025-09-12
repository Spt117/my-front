export interface IBeybladeToupie {
    title: string;
    productCode: string;
    rotationDirection: "right" | "left" | "both";
    type: "stamina" | "attack" | "defense" | "balance";
    series: "Burst" | "Metal Fight" | "X";
    system: string;
    brand: "Hasbro" | "Takara Tomy";
    pack: "starter" | "booster";
    image: string;
    releaseDate: Date;
    asinEurope?: string;
    asinAmerica?: string;
    asinJapan?: string;
}
