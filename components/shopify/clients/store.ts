import { ShopifyCustomer } from '@/library/shopify/clients';
import { create } from 'zustand';

interface ClientsState {
    clients: ShopifyCustomer[];
    setClients: (clients: ShopifyCustomer[]) => void;
    filterClients: ShopifyCustomer[];
    setFilterClients: (clients: ShopifyCustomer[]) => void;
    clientsSearch: ShopifyCustomer[];
    setClientsSearch: (clients: ShopifyCustomer[]) => void;
    searchTermClient: string;
    setSearchTermClient: (term: string) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

const useClientsStore = create<ClientsState>((set) => ({
    clients: [],
    setClients: (clients) => set({ clients }),
    filterClients: [],
    setFilterClients: (filterClients) => set({ filterClients }),
    clientsSearch: [],
    setClientsSearch: (clientsSearch) => set({ clientsSearch }),
    searchTermClient: '',
    setSearchTermClient: (searchTermClient) => set({ searchTermClient }),
    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useClientsStore;
