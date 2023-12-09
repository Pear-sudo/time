import {isOrAre} from "@/app/utility/lanUtil";

export class Scheduler {
    registry: { date: Date, f: Function, handle: number }[] = []

    registerTasks(tasks: { date: Date, f: Function }[] | { date: Date, f: Function }): void {
        console.log('registering tasks...')
        if (!(tasks instanceof Array)) {
            tasks = [tasks]
        }
        for (const task of tasks) {
            const taskDate = task.date
            const taskFunction = task.f

            const targetMilli: number = taskDate.valueOf()
            const handle: number = setTimeout(taskFunction, targetMilli - new Date().valueOf()) as unknown as number

            this.registry.push({date: taskDate, f: taskFunction, handle: handle})

            console.log(`function: ${taskFunction.name} is scheduled at ${taskDate.toLocaleString()}.`)
        }
    }

    removeAllTasks(): void {
        while (this.registry.length > 0) {
            clearTimeout(this.registry[0].handle)
            this.registry.shift();
        }
    }

    removeTaskByFunction(f: Function): number {
        // return the number of task removed
        let count: number = 0
        this.registry = this.registry.filter((element) => {
            if (element.f == f) {
                count++
                clearTimeout(element.handle)
                return false
            } else {
                return true
            }
        })
        console.log(`${count} tasks related to function ${f.name} ${isOrAre(count)} removed at ${new Date().toLocaleString()}`)
        return count
    }
}