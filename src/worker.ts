export interface Env {
}

export default {
    scheduled: async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
        console.log('Doing some work')
    }
};
