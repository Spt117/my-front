'use client';

export default function Layout({ children }: { children: React.ReactNode }) {
    // useEffect(() => {
    // const getData = async () => {
    //     const res = await getKeepaProduct(5, 'B0C52KJB9K');
    //     console.log(res);
    //     if (!res) {
    //         console.log('No data');
    //         return;
    //     }
    //     const price = getLastPrice(res);
    //     console.log(price);
    // };
    // getData();
    // });

    return <>{children}</>;
}
