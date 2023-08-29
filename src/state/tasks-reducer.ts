import {AddTodolistActionType, RemoveTodolistActionType, setTodolistsActionType} from './todolists-reducer';
import {
    // TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    TodolistType,
    UpdateTaskModelType
} from '../api/todolists-api'
import {Dispatch} from "react";
import {AppRootStateType} from "./store";

const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/
}

export type TasksStateType = {
    [key: string]: Array<TaskType>
}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        //'SET-TODOLISTS' & setTodolistsActionType - экспортировали из todolist-reducer
        case 'SET-TODOLISTS': {  //при создании тудулиста добавляем к нему пустой массив тасок
            let stateCopy = {...state};
            action.todolists.forEach(tl => {
                stateCopy[tl.id] = []
            })
            return stateCopy
        }

        case 'SET-TASKS': {
            return {
                ...state,
                [action.todolistId]: action.tasks
            }
        }

        case 'REMOVE-TASK': {
            // const stateCopy = {...state}
            // const tasks = stateCopy[action.todolistId];
            // const newTasks = tasks.filter(t => t.id !== action.taskId);
            // stateCopy[action.todolistId] = newTasks;
            // return stateCopy;
            return {
                ...state,
                [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)
            }
        }
        case 'ADD-TASK': {
            return {
                ...state,
                [action.todolistId]: [action.task, ...state[action.todolistId]]
            }

        }
        case 'CHANGE-TASK-STATUS': {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, status: action.status} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'CHANGE-TASK-TITLE': {
            let todolistTasks = state[action.todolistId];
            // найдём нужную таску:
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.todolist.id]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        default:
            return state;
    }
}

//thunk
export const fetchTasksThunk = (todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTasksAC(tasks, todolistId))
        })
}

export const removeTaskThunk = (todolistId: string, taskId: string) => (dispatch: Dispatch<ActionsType>) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then((res) => {
            dispatch(removeTaskAC(taskId, todolistId))
        })
}

export const createTaskThunk = (todolistId: string, title: string) => (dispatch: Dispatch<ActionsType>) => {
    todolistsAPI.createTask(todolistId, title)  //отдали todolistId, title
        .then((res) => { //получили в ответе созданную task-TaskType
            dispatch(addTaskAC(res.data.data.item, todolistId))
        })
}

//для апдейта найдём из стейта (ч-з getState) таску и обновим поля, после чего обновлённую версию отправим на сервер post запросом
//здесь изм только статус
//export const updateTaskStatusThunk = (todolistId: string, taskId: string, status: TaskStatuses) =>
export const updateTaskStatusThunk = (todolistId: string, taskId: string, property: TaskStatuses | string) =>
    (dispatch: Dispatch<ActionsType>, getState: () => AppRootStateType) => {
        const task = getState().tasks[todolistId].find(t => t.id === taskId)

        if (task && typeof property === 'number') {  //TaskStatuses - enum c номерами
            // const model: UpdateTaskModelType = {
            //     title: task.title,
            //     description: task.description,
            //     deadline: task.deadline,
            //     startDate: task.startDate,
            //     priority: task.priority,
            //     status,                   // !!! заменим status
            // }
            const propertyObj = {status: property}
            const model: UpdateTaskModelType = {
                ...task,
                ...propertyObj
            }
            todolistsAPI.updateTask(todolistId, taskId, model)  //отдали todolistId, title
                .then((res) => {
                    dispatch(changeTaskStatusAC(taskId, property, todolistId)) //получили ответ и изменяем UI
                })
        }
        if (task && typeof property === 'string') {
            const propertyObj = {title: property}
            const model: UpdateTaskModelType = {
                ...task,
                ...propertyObj
            }

            todolistsAPI.updateTask(todolistId, taskId, model)  //отдали todolistId, title
                .then((res) => {
                    dispatch(changeTaskTitleAC(taskId, property, todolistId)) //получили ответ и изменяем UI
                })
        }

    }

//Actioncreators
export const removeTaskAC = (taskId: string, todolistId: string) => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId} as const
}

export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) => {
    return {type: 'SET-TASKS', tasks, todolistId} as const
}

export const addTaskAC = (task: TaskType, todolistId: string) => {
    return {type: 'ADD-TASK', task, todolistId} as const
}

export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string) => {
    return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId} as const
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string) => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId} as const
}

//types
export type RemoveTaskActionType = ReturnType<typeof removeTaskAC>
export type SetTasksActionType = ReturnType<typeof setTasksAC>
export type AddTaskActionType = ReturnType<typeof addTaskAC>
export type ChangeTaskStatusActionType = ReturnType<typeof changeTaskStatusAC>
export type ChangeTaskTitleActionType = ReturnType<typeof changeTaskTitleAC>

type ActionsType = RemoveTaskActionType
    | AddTaskActionType
    | ChangeTaskStatusActionType
    | setTodolistsActionType //экспортировали из todolist-reducer
    | SetTasksActionType
    | setTodolistsActionType
    | ChangeTaskTitleActionType
    | AddTodolistActionType  //экспортировали из todolist-reducer
    | RemoveTodolistActionType //экспортировали из todolist-reducer
