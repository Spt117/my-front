import { getBoutiques } from './paramsShopify';
import { sitesWordpress } from './paramsWordpress';

export const niches = ['Pokémon', 'Beyblade'] as const;
export type TNiche = (typeof niches)[number];

export const pokemonProducts = ['peluche pokémon', 'figurine pokémon', 'carte'] as const;
export type TPokemonProducts = (typeof pokemonProducts)[number];

export const beybladeProducts = ['Toupie', 'Lanceur', 'Arène'] as const;
export type TBeybladeProducts = (typeof beybladeProducts)[number];
export const brandBeyblade = ['Hasbro', 'Takara Tomy'] as const;
export type TBrandBeyblade = (typeof brandBeyblade)[number];

export const allProducts = {
    Pokémon: pokemonProducts,
    Beyblade: beybladeProducts,
};

export async function getWebsites(): Promise<string[]> {
    const shops = await getBoutiques();
    return [...sitesWordpress.map((site) => site.domain), ...shops.map((shop) => shop.publicDomain)].sort();
}
