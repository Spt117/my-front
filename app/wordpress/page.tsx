import { getServer } from '@/library/utils/fetchServer';
import { pokeUriServer } from '@/library/utils/uri';
import Article from './Article';

export default async function Page() {
    const url = `${pokeUriServer}/wordpress?site=beyblade-x.fr`;
    const res = await getServer(url);
    console.log('Response from server:');
    const data = res.response.data[0];
    console.log(data);

    return (
        <div className="flex flex-col gap-4 p-4 justify-center items-center">
            <Article data={data} />
        </div>
    );
}
