import React, { useEffect } from "react";
import LayoutRoutes from "../Utilities/LayoutRoutes";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import useDescriptionTitle from "../hooks/useDescriptionTitle";
import { getPostList } from "../../store/Tasks.store";

const Home: React.FC = () => {
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getPostList());
  }, []);

  useDescriptionTitle("Organize your tasks", "All tasks");
  return <LayoutRoutes title="All tasks" tasks={tasks}></LayoutRoutes>;
};

export default Home;
