import {
  Action,
  createSlice,
  Dispatch,
  MiddlewareAPI,
  PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import axios from "axios";
import { Task } from "../interfaces";

export const getPostList: any = createAsyncThunk("post/postList", async (postData, { rejectWithValue }) => {
  try {
     const { data } = await axios.get(`http://127.0.0.1:8000/api/post/list/`);
     return data;
  } catch (err:any) {
    return rejectWithValue(err.message);
  }
});

export const getDirectoryList: any = createAsyncThunk("post/directoryList", async (postData, { rejectWithValue }) => {
  try {
     const { data } = await axios.get(
       `http://127.0.0.1:8000/api/post/directory/`
     );
     return data;
  } catch (err:any) {
    return rejectWithValue(err.message);
  }
});

export const postData:any = createAsyncThunk("postData", async (data, thunkAPI) => {
  const response: any = await axios
    .post(`http://127.0.0.1:8000/api/post/list/`, data)
    .then(function (response) {
      console.log(response);
      getPostList();
    })
    .catch(function (error) {
      console.log(error);
    });
  return response.data;
});

export const editPostData:any = createAsyncThunk("postData", async (data:any, thunkAPI) => {
  const response: any = await axios
    .patch(`http://127.0.0.1:8000/api/post/list/${data.id}/`, data)
    .then(function (response) {
      console.log(response);
      getPostList();
    })
    .catch(function (error) {
      console.log(error);
    });
  return response.data;
});

export const deletePostData:any = createAsyncThunk("postData", async (id, thunkAPI) => {
  const response: any = await axios
    .delete(`http://127.0.0.1:8000/api/post/list/${id}/`)
    .then(function (response) {
      console.log(response);
      getPostList();
    })
    .catch(function (error) {
      console.log(error);
    });
  return response.data;
});

const defaultTasks: Task[] = [
  {
    title: "Task 1",
    important: false,
    description: "This is the description for this task",
    date: "2023-04-12",
    dir: "Main",
    completed: true,
    id: "t1",
  },
  {
    title: "Task 2",
    important: true,
    description: "This is the description for this task",
    date: "2023-05-15",
    dir: "Main",
    completed: true,
    id: "t2",
  },
  {
    title: "Task 3",
    important: false,
    description: "This is the description for this task",
    date: "2023-08-21",
    dir: "Main",
    completed: false,
    id: "t3",
  },
];

const getSavedDirectories = (): string[] => {
  let dirList: string[] = [];
  if (localStorage.getItem("directories")) {
    dirList = JSON.parse(localStorage.getItem("directories")!);
    const mainDirExists = dirList.some((dir: string) => dir === "Main");
    if (!mainDirExists) {
      dirList.push("Main");
    }
  } else {
    dirList.push("Main");
  }

  if (localStorage.getItem("tasks")) {
    const savedTasksList = JSON.parse(localStorage.getItem("tasks")!);
    let dirNotSaved: string[] = [];
    savedTasksList.forEach((task: Task) => {
      if (!dirList.includes(task.dir)) {
        if (!dirNotSaved.includes(task.dir)) {
          dirNotSaved.push(task.dir);
        }
      }
    });
    dirList = [...dirList, ...dirNotSaved];
  }
  return dirList;
};

const getTestDirList = (data:any): string[] => {
  let dirList: string[] = [];
  data.map((dir: any) => dirList.push(dir.dir));
  return dirList;
}

const initialState: {
  tasks: Task[];
  directories: string[];
} = {
  tasks: localStorage.getItem("tasks")
    ? JSON.parse(localStorage.getItem("tasks")!)
    : defaultTasks,
  directories: getSavedDirectories(),
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState: initialState,
  extraReducers: {
    [getPostList.fulfilled]: (state, { payload }) => {
      state.tasks = payload;
    },
    [getDirectoryList.fulfilled]: (state, { payload }) => {
      state.directories = getTestDirList(payload);
    },
  },
  reducers: {
    addNewTask(state, action: PayloadAction<Task>) {
      state.tasks = [action.payload, ...state.tasks];
    },
    removeTask(state, action) {
      const newTasksList = state.tasks.filter(
        (task) => task.id !== action.payload
      );
      state.tasks = newTasksList;
    },
    markAsImportant(state, action: PayloadAction<string>) {
      const newTaskFavorited = state.tasks.find(
        (task) => task.id === action.payload
      );
      newTaskFavorited!.important = !newTaskFavorited!.important;
    },
    editTask(state, action: PayloadAction<Task>) {
      const taskId = action.payload.id;

      const newTaskEdited: Task = state.tasks.find(
        (task: Task) => task.id === taskId
      )!;
      const indexTask = state.tasks.indexOf(newTaskEdited);
      state.tasks[indexTask] = action.payload;
    },
    toggleTaskCompleted(state, action: PayloadAction<string>) {
      const taskId = action.payload;

      const currTask = state.tasks.find((task) => task.id === taskId)!;

      currTask.completed = !currTask.completed;
    },
    deleteAllData(state) {
      state.tasks = [];
      state.directories = ["Main"];
    },
    createDirectory(state, action: PayloadAction<string>) {
      const newDirectory: string = action.payload;
      const directoryAlreadyExists = state.directories.includes(newDirectory);
      if (directoryAlreadyExists) return;
      state.directories = [newDirectory, ...state.directories];
    },
    deleteDirectory(state, action: PayloadAction<string>) {
      const dirName = action.payload;

      state.directories = state.directories.filter((dir) => dir !== dirName);
      state.tasks = state.tasks.filter((task) => task.dir !== dirName);
    },
    editDirectoryName(
      state,
      action: PayloadAction<{ newDirName: string; previousDirName: string }>
    ) {
      const newDirName: string = action.payload.newDirName;
      const previousDirName: string = action.payload.previousDirName;
      const directoryAlreadyExists = state.directories.includes(newDirName);
      if (directoryAlreadyExists) return;

      const dirIndex = state.directories.indexOf(previousDirName);

      state.directories[dirIndex] = newDirName;
      state.tasks.forEach((task) => {
        if (task.dir === previousDirName) {
          task.dir = newDirName;
        }
      });
    },
  },
});

export const tasksActions = tasksSlice.actions;
export default tasksSlice.reducer;

export const tasksMiddleware =
  (store: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
    const nextAction = next(action);
    const actionChangeOnlyDirectories =
      tasksActions.createDirectory.match(action);

    const isADirectoryAction: boolean = action.type
      .toLowerCase()
      .includes("directory");

    if (action.type.startsWith("tasks/") && !actionChangeOnlyDirectories) {
      const tasksList = store.getState().tasks.tasks;
      localStorage.setItem("tasks", JSON.stringify(tasksList));
    }
    if (action.type.startsWith("tasks/") && isADirectoryAction) {
      const dirList = store.getState().tasks.directories;
      localStorage.setItem("directories", JSON.stringify(dirList));
    }

    if (tasksActions.deleteAllData.match(action)) {
      localStorage.removeItem("tasks");
      localStorage.removeItem("directories");
      localStorage.removeItem("darkmode");
    }

    if (tasksActions.removeTask.match(action)) {
      console.log(JSON.parse(localStorage.getItem("tasks")!));
      if (localStorage.getItem("tasks")) {
        const localStorageTasks = JSON.parse(localStorage.getItem("tasks")!);
        if (localStorageTasks.length === 0) {
          localStorage.removeItem("tasks");
        }
      }
    }
    return nextAction;
  };
