import { LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import Order from './Order';
import OrderCompact from './OrderCompact';
import useOrdersStore from './store';

export default function MappingOrders() {
    const { filterOrders, mode } = useOrdersStore();
    const [isCompact, setIsCompact] = useState(true);

    if (mode !== 'orders') return null;
    return (
        <div className="space-y-4 w-full">
            <div className="flex justify-between items-center mx-3 my-4 backdrop-blur-md bg-white/30 p-2 rounded-xl border border-white/40 shadow-sm sticky top-22 z-10">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 px-2">{filterOrders.length} commandes</h1>
                <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200" onClick={() => setIsCompact(!isCompact)}>
                    <button
                        className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                            !isCompact ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                        }`}
                        title="Vue détaillée"
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                            isCompact ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                        }`}
                        title="Vue compacte"
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            <div className={isCompact ? 'space-y-2' : 'space-y-6'}>
                {filterOrders.map((order, index) => (isCompact ? <OrderCompact key={index} order={order} /> : <Order key={index} order={order} />))}
            </div>
        </div>
    );
}
