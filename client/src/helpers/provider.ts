import { JsonRpcProvider } from '@ethersproject/providers';
import config from '@/config';

const provider = new JsonRpcProvider(config.rpcUrl as any);

export default provider;
