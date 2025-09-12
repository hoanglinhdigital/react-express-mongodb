import React from "react";
import axios from "axios";
import "./App.scss";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      todos: [],
    };
  }

  componentDidMount() {
    axios
      .get("/api")
      .then((response) => {
        this.setState({
          todos: response.data.data,
        });
      })
      .catch((e) => console.log("Error : ", e));
  }

  handleAddTodo = (value) => {
    console.log("Adding new todo:", value); // Debug log
    
    axios
      .post("/api/todos", { text: value })
      .then((response) => {
        console.log("Backend response:", response.data); // Debug log
        
        // Use the actual todo object returned by the backend
        const newTodo = response.data.data;
        
        this.setState({
          todos: [...this.state.todos, newTodo], // Use the complete todo object
        });
        
        console.log("Updated todos state:", [...this.state.todos, newTodo]); // Debug log
      })
      .catch((e) => console.log("Error : ", e));
  };

  handleToggleTodo = (todoId, newDoneStatus) => {
    this.setState({
      todos: this.state.todos.map(todo =>
        todo._id === todoId ? { ...todo, done: newDoneStatus } : todo
      ),
    });
  };

  handleDeleteTodo = (todoId) => {
    this.setState({
      todos: this.state.todos.filter(todo => todo._id !== todoId),
    });
  };

  render() {
    return (
      <div className="App container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 col-sm-8 col-md-8 offset-md-2">
              <h1>Todos App</h1>
              <h3>Using react, mongo, express</h3>
              <div className="todo-app">
                <AddTodo handleAddTodo={this.handleAddTodo} />
                <TodoList 
                  todos={this.state.todos}
                  onToggleTodo={this.handleToggleTodo}
                  onDeleteTodo={this.handleDeleteTodo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}