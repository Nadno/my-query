import { MiniQuery } from './core/base';
import { MQCollectionPlugin, MQCorePlugin, MQEventPlugin } from './plugins';
import { MQSignalBinderPlugin } from './plugins/binder';
import { MQBuilderPlugin } from './plugins/builder';

MiniQuery.use(MQBuilderPlugin);
MiniQuery.use(MQCorePlugin);
MiniQuery.use(MQCollectionPlugin);
MiniQuery.use(MQEventPlugin);
MiniQuery.use(MQSignalBinderPlugin);

export default MiniQuery;
