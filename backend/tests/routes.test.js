const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const routes = require('../routes/index');

// Mock prompt-client to prevent errors
jest.mock('prom-client', () => ({
    collectDefaultMetrics: jest.fn(),
    register: {
        contentType: 'text/plain',
        metrics: jest.fn().mockResolvedValue('metrics')
    }
}));

// Mock the Todo model
jest.mock('../models/todos/todo', () => {
    const saveMock = jest.fn();
    const mockTodoModel = function (todo) {
        this.text = todo.text;
        this.save = saveMock;
    };
    mockTodoModel.find = jest.fn();
    mockTodoModel.findByIdAndUpdate = jest.fn();
    mockTodoModel.findByIdAndDelete = jest.fn();

    return { Todo: mockTodoModel, saveMock }; // Export saveMock to assert on it
});

const { Todo, saveMock } = require('../models/todos/todo');

describe('Todo Routes API Unit Tests', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        // Initialize routes
        routes(app);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/', () => {
        it('should return all todos on success', async () => {
            const mockTodos = [
                { _id: '1', text: 'Task 1', done: false },
                { _id: '2', text: 'Task 2', done: true }
            ];
            Todo.find.mockResolvedValue(mockTodos);

            const res = await request(app).get('/api/');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(mockTodos);
            expect(Todo.find).toHaveBeenCalledWith({}, { __v: 0 });
        });

        it('should return 400 on error', async () => {
            Todo.find.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/api/');
            expect(res.statusCode).toBe(400); // serverResponses defaults to 400 for errors
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/todos', () => {
        it('should create a new todo', async () => {
            const newTodo = { _id: '123', text: 'New Task', done: false };
            saveMock.mockResolvedValue(newTodo);

            const res = await request(app)
                .post('/api/todos')
                .send({ text: 'New Task' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(newTodo);
            expect(saveMock).toHaveBeenCalled();
        });

        it('should return 400 if save fails', async () => {
            saveMock.mockRejectedValue(new Error('Validation error'));

            const res = await request(app)
                .post('/api/todos')
                .send({ text: 'Bad Task' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/todos/:todoId', () => {
        it('should update and return the todo if a valid ID is passed', async () => {
            const validId = new mongoose.Types.ObjectId().toString();
            const updatedTodo = { _id: validId, text: 'Update Task', done: true };

            Todo.findByIdAndUpdate.mockResolvedValue(updatedTodo);

            const res = await request(app)
                .put(`/api/todos/${validId}`)
                .send({});

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(updatedTodo);
            expect(Todo.findByIdAndUpdate).toHaveBeenCalledWith(
                validId,
                { done: true },
                { new: true, runValidators: true }
            );
        });

        it('should return 400 if ID is invalid', async () => {
            const res = await request(app).put('/api/todos/invalid-id');
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Invalid todo ID format');
        });

        it('should return 400 if todo is not found', async () => {
            const validId = new mongoose.Types.ObjectId().toString();
            Todo.findByIdAndUpdate.mockResolvedValue(null);

            const res = await request(app).put(`/api/todos/${validId}`);
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Todo not found');
        });
    });

    describe('DELETE /api/todos/:todoId', () => {
        it('should delete and return the todo if a valid ID is passed', async () => {
            const validId = new mongoose.Types.ObjectId().toString();
            const deletedTodo = { _id: validId, text: 'Delete Task', done: false };

            Todo.findByIdAndDelete.mockResolvedValue(deletedTodo);

            const res = await request(app).delete(`/api/todos/${validId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(deletedTodo);
            expect(Todo.findByIdAndDelete).toHaveBeenCalledWith(validId);
        });

        it('should return 400 if ID is invalid', async () => {
            const res = await request(app).delete('/api/todos/invalid-id');
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Invalid todo ID format');
        });

        it('should return 400 if todo is not found', async () => {
            const validId = new mongoose.Types.ObjectId().toString();
            Todo.findByIdAndDelete.mockResolvedValue(null);

            const res = await request(app).delete(`/api/todos/${validId}`);
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Todo not found');
        });
    });
});
