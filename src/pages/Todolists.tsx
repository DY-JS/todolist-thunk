import React, {useCallback, useEffect} from 'react';
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import {Todolist} from "./Todolist";
import {useAppDispatch, useAppSelector} from "../state/store";
import {
    addTodolistTC,
    removeTodolistTC,
    changeTodolistTitleTC,
    changeTodolistFilterAC,
    fetchTodolistsTC,
    FilterValuesType,
    TodolistDomainType
} from "../state/todolists-reducer";
import {
    changeTaskTitleAC,
    createTaskThunk,
    removeTaskThunk,
    TasksStateType,
    updateTaskStatusThunk
} from "../state/tasks-reducer";
import {TaskStatuses} from "../api/todolists-api";
import {AddItemForm} from "../components/AddItemForm";

const Todolists = () => {
    const todolists = useAppSelector<Array<TodolistDomainType>>(state => state.todolists)
    const tasks = useAppSelector<TasksStateType>(state => state.tasks)
    // const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(state => state.todolists)
    // const tasks = useSelector<AppRootStateType, TasksStateType>(state => state.tasks)
    //const dispatch = useDispatch();
    const dispatch = useAppDispatch();

    const removeTask = useCallback(function (id: string, todolistId: string) {
        dispatch(removeTaskThunk(todolistId, id));
    }, []);

    const addTask = useCallback(function (title: string, todolistId: string) {
        dispatch(createTaskThunk( todolistId, title));
    }, []);

    const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
        //const action = changeTaskStatusAC(id, status, todolistId);
        //dispatch(action);
        dispatch(updateTaskStatusThunk(todolistId, id, status))
    }, []);

    const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
        const action = changeTaskTitleAC(id, newTitle, todolistId);
        dispatch(action);
    }, []);

    const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
        //const action = changeTodolistFilterAC(todolistId, value);
        console.log(value)
        dispatch(changeTodolistFilterAC(todolistId, value));
    }, []);

    const removeTodolist = useCallback(function (id: string) {
        //const action = removeTodolistAC(id);
        dispatch(removeTodolistTC(id));
    }, []);

    const changeTodolistTitle = useCallback(function (id: string, title: string) {
        //const action = changeTodolistTitleAC(id, title);
        dispatch(changeTodolistTitleTC(id, title));
    }, []);

    const addTodolist = useCallback((title: string) => {
        //const action = addTodolistAC(title);
        dispatch(addTodolistTC(title));
    }, [dispatch]);

    useEffect(() => {
        //todolistsAPI.getTodolists().then(res => dispatch(setTodolistsAC(res.data)))
        dispatch(fetchTodolistsTC())
    },[])


    return (
        <>
            <Grid container style={{padding: '20px'}}>
                <AddItemForm addItem={addTodolist}/>
            </Grid>
            <Grid container spacing={3}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id];

                    return <Grid item key={tl.id}>
                        <Paper style={{padding: '10px'}}>
                            <Todolist
                                id={tl.id}
                                title={tl.title}
                                tasks={allTodolistTasks}
                                removeTask={removeTask}
                                changeFilter={changeFilter}
                                addTask={addTask}
                                changeTaskStatus={changeStatus}
                                filter={tl.filter}
                                removeTodolist={removeTodolist}
                                changeTaskTitle={changeTaskTitle}
                                changeTodolistTitle={changeTodolistTitle}
                            />
                        </Paper>
                    </Grid>
                })
            }
            </Grid>
        </>
    );
};

export default Todolists;