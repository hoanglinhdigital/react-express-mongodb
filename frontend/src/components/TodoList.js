import React from "react";
import axios from "axios";

export default class TodoList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIndex: 0,
    };
  }

  handleActive(index) {
    this.setState({
      activeIndex: index,
    });
  }

  handleToggleDone = (todoId, currentStatus) => {
    // Call API to toggle the done status
    axios
      .put(`/api/todos/${todoId}`, { done: !currentStatus })
      .then(() => {
        // Update the todo in parent component
        this.props.onToggleTodo(todoId, !currentStatus);
      })
      .catch((e) => console.log("Error toggling todo: ", e));
  };

  handleDeleteTodo = (todoId) => {
    // Call API to delete the todo
    axios
      .delete(`/api/todos/${todoId}`)
      .then(() => {
        // Remove the todo from parent component
        this.props.onDeleteTodo(todoId);
      })
      .catch((e) => console.log("Error deleting todo: ", e));
  };

  renderTodos(todos) {
    return (
      <ul className="list-group">
        {todos.map((todo, i) => (
          <li
            className={
              "list-group-item d-flex justify-content-between align-items-center " +
              (i === this.state.activeIndex ? "active" : "") +
              (todo.done ? " list-group-item-success" : "")
            }
            key={todo._id || i}
          >
            <div className="d-flex align-items-center flex-grow-1">
              <input
                type="checkbox"
                className="form-check-input me-3"
                checked={todo.done || false}
                onChange={() => this.handleToggleDone(todo._id, todo.done)}
                onClick={(e) => e.stopPropagation()}
              />
              <span
                className={
                  "cursor-pointer flex-grow-1 " + (todo.done ? "text-decoration-line-through" : "")
                }
                onClick={() => {
                  this.handleActive(i);
                }}
              >
                {todo.text}
              </span>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                this.handleDeleteTodo(todo._id);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    );
  }

  render() {
    let { todos } = this.props;
    return todos.length > 0 ? (
      this.renderTodos(todos)
    ) : (
      <div className="alert alert-primary" role="alert">
        No Todos to display
      </div>
    );
  }
}