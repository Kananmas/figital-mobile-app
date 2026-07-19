export default class EventManager {
    private events:{
        [name:string]:Function[],
    }={}


    public addEventListener(name:string , listener:Function) {
        if(!this.events[name]) {
            this.events[name] = [];
        }

        this.events[name].push(listener);
    }


    public removeEventListener(name:string , listener:Function) {
        if(!this.events[name]) return;
        const stack = this.events[name];

        this.events[name] = stack.filter((item) => item !== listener);
    }

    public emitEvent(name:string , e:any) {
        if(!this.events[name]) return;
        this.events[name].forEach((item) => item(e))
    }
}