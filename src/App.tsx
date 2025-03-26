/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';

import { Todo } from './types/Todo';
import { FilterBy } from './types/FilterBy';

import { USER_ID, getTodos } from './api/todos';

import { UserWarning } from './UserWarning';
import { TodoAppHeader } from './components/TodoAppHeader';
import { TodoList } from './components/TodoList';
import { TodoAppFooter } from './components/TodoAppFooter';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [todosFromServer, setTodosFromServer] = useState<Todo[]>([]);
  const [visibleTodos, setVisibleTodos] = useState<Todo[]>([]);
  const [filterBy, setFilterBy] = useState(FilterBy.All);

  useEffect(() => {
    setErrorMessage('');
    setIsLoading(true);
    getTodos()
      .then(setTodosFromServer)
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let todos;

    switch (filterBy) {
      case FilterBy.Active:
        todos = todosFromServer.filter(todo => !todo.completed);
        break;
      case FilterBy.Completed:
        todos = todosFromServer.filter(todo => todo.completed);
        break;
      default:
        todos = [...todosFromServer];
        break;
    }

    setVisibleTodos(todos);
  }, [todosFromServer, filterBy]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const addNewTodo = (todoToAdd: Todo) => {
    const maxId = Math.max(...visibleTodos.map(todo => todo.id));
    const newTodo: Todo = { ...todoToAdd, id: maxId + 1, userId: USER_ID };

    setVisibleTodos(currentTodos => [...currentTodos, newTodo]);
  };

  const updateTodo = (updatedTodo: Todo) => {
    const idToUpdate = visibleTodos.findIndex(
      todo => todo.id === updatedTodo.id,
    );

    if (idToUpdate === undefined) {
      setErrorMessage('Unable to update a todo');

      return;
    }

    const newTodos = [...visibleTodos];

    newTodos.splice(idToUpdate, 1, updatedTodo);

    setVisibleTodos(newTodos);
  };

  const removeTodo = (idToRemove: number) => {
    setVisibleTodos(currentTodos =>
      currentTodos.filter(todo => todo.id !== idToRemove),
    );
  };

  const toggleAll = (completeAll: boolean) => {
    setVisibleTodos(currentTodos => [
      ...currentTodos.map(todo => ({ ...todo, completed: completeAll })),
    ]);
  };

  const clearError = () => setErrorMessage('');

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoAppHeader
          todos={visibleTodos}
          onAdd={addNewTodo}
          onToggleAll={toggleAll}
        />

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          todosFromServer.length > 0 && (
            <>
              <TodoList
                todos={visibleTodos}
                onTodoEdit={updateTodo}
                onTodoRemove={removeTodo}
              />

              <TodoAppFooter
                todos={todosFromServer}
                currentFilter={filterBy}
                onfilterChange={setFilterBy}
              />
            </>
          )
        )}
      </div>

      <ErrorNotification errorMessage={errorMessage} clearError={clearError} />
    </div>
  );
};
