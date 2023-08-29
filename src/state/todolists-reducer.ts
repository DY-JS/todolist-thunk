import { useDispatch } from 'react-redux';
import { v1 } from 'uuid';
import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {ThunkDispatchType, useAppDispatch} from "./store";


const initialState: Array<TodolistDomainType> = [
    /*{id: todolistId1, title: 'What to learn', filter: 'all', addedDate: '', order: 0},
    {id: todolistId2, title: 'What to buy', filter: 'all', addedDate: '', order: 0}*/
]

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'SET-TODOLISTS': {
            return action.todolists.map(tl => ({
                ...tl,
                 filter: 'all'
            }))
        }

        case 'REMOVE-TODOLIST': {
            return state.filter(tl => tl.id !== action.id)
        }
        case 'ADD-TODOLIST': {
            return [{
                id: action.todolistId,
                title: action.title,
                filter: 'all',
                addedDate: '',
                order: 0
            }, ...state]
        }
        case 'CHANGE-TODOLIST-TITLE': {
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : {...tl})
            // const todolist = state.find(tl => tl.id === action.id);
            // if (todolist) {
            //     // если нашёлся - изменим ему заголовок
            //     todolist.title = action.title;
            // }
            // return [...state]
        }
        case 'CHANGE-TODOLIST-FILTER': {
            return state.map(tl => tl.id === action.id ? {...tl, title: action.filter} : {...tl})
        }
        default:
            return state;
    }
}

export const setTodolistsAC = (todolists: TodolistType[]) => {
    return {type: 'SET-TODOLISTS', todolists} as const
}

export const removeTodolistAC = (todolistId: string) => {
    return {type: 'REMOVE-TODOLIST', id: todolistId} as const
}
export const addTodolistAC = (title: string) => {
    return {type: 'ADD-TODOLIST', title: title, todolistId: v1()} as const
}
export const changeTodolistTitleAC = (id: string, title: string) => {
    return {type: 'CHANGE-TODOLIST-TITLE', id: id, title: title} as const
}
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => {
    return {type: 'CHANGE-TODOLIST-FILTER', id: id, filter: filter} as const
}

//export const fetchTodolistsThunk = (dispatch: Dispatch) => {       //так это thunk
export const fetchTodolistsThunk = () => (dispatch: Dispatch) => {  //так - thunk creator, можно передавать аргументы
    todolistsAPI.getTodolists().then(res => {
        console.log(res)
        dispatch(setTodolistsAC(res.data));
    });
}

// export type setTodolistsActionType = {
//     type: 'SET-TODOLISTS',
//     todolists: TodolistType[]
// }

export type setTodolistsActionType = ReturnType<typeof setTodolistsAC>
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
export type ChangeTodolistTitleActionType = ReturnType<typeof changeTodolistTitleAC>
export type ChangeTodolistFilterActionType = ReturnType<typeof changeTodolistFilterAC>

type ActionsType = RemoveTodolistActionType
    | AddTodolistActionType
    | ChangeTodolistTitleActionType
    | ChangeTodolistFilterActionType
    | setTodolistsActionType

