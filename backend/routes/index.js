const express = require("express");
const serverResponses = require("../utils/helpers/responses");
const messages = require("../config/messages");
const { Todo } = require("../models/todos/todo");

const routes = (app) => {
  const router = express.Router();

  router.post("/todos", (req, res) => {
    const todo = new Todo({
      text: req.body.text,
    });

    todo
      .save()
      .then((result) => {
        serverResponses.sendSuccess(res, messages.SUCCESSFUL, result);
      })
      .catch((e) => {
        serverResponses.sendError(res, messages.BAD_REQUEST, e);
      });
  });

  router.get("/", (req, res) => {
    Todo.find({}, { __v: 0 })
      .then((todos) => {
        serverResponses.sendSuccess(res, messages.SUCCESSFUL, todos);
      })
      .catch((e) => {
        serverResponses.sendError(res, messages.BAD_REQUEST, e);
      });
  });

  // PUT method to update todo status to done
  router.put("/todos/:todoId", (req, res) => {
    console.log("=== PUT /todos/:todoId - START ===");
    console.log("Request received at:", new Date().toISOString());
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);
    
    const { todoId } = req.params;
    console.log("Extracted todoId:", todoId);
    console.log("TodoId type:", typeof todoId);
    console.log("TodoId length:", todoId ? todoId.length : 'undefined');
    
    // Validate todoId format (MongoDB ObjectId should be 24 hex characters)
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      console.log("ERROR: Invalid todoId format");
      return serverResponses.sendError(res, "Invalid todo ID format", null);
    }
    console.log("TodoId validation: PASSED");
    
    console.log("Attempting to find and update todo...");
    Todo.findByIdAndUpdate(
      todoId,
      { done: true },
      { new: true, runValidators: true }
    )
      .then((updatedTodo) => {
        console.log("Database operation completed");
        console.log("Updated todo result:", updatedTodo);
        
        if (!updatedTodo) {
          console.log("ERROR: Todo not found in database");
          return serverResponses.sendError(res, "Todo not found", null);
        }
        
        console.log("SUCCESS: Todo updated successfully");
        console.log("=== PUT /todos/:todoId - END (SUCCESS) ===");
        
        // Debug the serverResponses function
        console.log("About to call serverResponses.sendSuccess");
        console.log("serverResponses object:", typeof serverResponses);
        console.log("sendSuccess function:", typeof serverResponses.sendSuccess);
        
        // Fix: Use explicit status code instead of relying on helper function
        try {
          serverResponses.sendSuccess(res, "Todo updated successfully", updatedTodo);
        } catch (responseError) {
          console.log("ERROR: Response helper failed, sending manual response");
          console.log("Response error:", responseError);
          // Fallback: send response manually
          res.status(200).json({
            success: true,
            message: "Todo updated successfully",
            data: updatedTodo
          });
        }
      })
      .catch((e) => {
        console.log("ERROR: Database operation failed");
        console.log("Error details:", e);
        console.log("Error message:", e.message);
        console.log("Error stack:", e.stack);
        console.log("=== PUT /todos/:todoId - END (ERROR) ===");
        serverResponses.sendError(res, messages.BAD_REQUEST, e);
      });
  });

// DELETE method to delete todo item
router.delete("/todos/:todoId", (req, res) => {
  console.log("=== DELETE /todos/:todoId - START ===");
  console.log("Request received at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  
  const { todoId } = req.params;
  console.log("Extracted todoId:", todoId);
  console.log("TodoId type:", typeof todoId);
  console.log("TodoId length:", todoId ? todoId.length : 'undefined');
  
  // Validate todoId format (MongoDB ObjectId should be 24 hex characters)
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(todoId)) {
    console.log("ERROR: Invalid todoId format");
    return serverResponses.sendError(res, "Invalid todo ID format", null);
  }
  console.log("TodoId validation: PASSED");
  
  console.log("Attempting to find and delete todo...");
  Todo.findByIdAndDelete(todoId)
    .then((deletedTodo) => {
      console.log("Database operation completed");
      console.log("Deleted todo result:", deletedTodo);
      
      if (!deletedTodo) {
        console.log("ERROR: Todo not found in database");
        return serverResponses.sendError(res, "Todo not found", null);
      }
      
      console.log("SUCCESS: Todo deleted successfully");
      console.log("=== DELETE /todos/:todoId - END (SUCCESS) ===");
      
      // Debug the serverResponses function
      console.log("About to call serverResponses.sendSuccess");
      console.log("serverResponses object:", typeof serverResponses);
      console.log("sendSuccess function:", typeof serverResponses.sendSuccess);
      
      // Fix: Use explicit status code instead of relying on helper function
      try {
        serverResponses.sendSuccess(res, "Todo deleted successfully", deletedTodo);
      } catch (responseError) {
        console.log("ERROR: Response helper failed, sending manual response");
        console.log("Response error:", responseError);
        // Fallback: send response manually
        res.status(200).json({
          success: true,
          message: "Todo deleted successfully",
          data: deletedTodo
        });
      }
    })
    .catch((e) => {
      console.log("ERROR: Database operation failed");
      console.log("Error details:", e);
      console.log("Error message:", e.message);
      console.log("Error stack:", e.stack);
      console.log("=== DELETE /todos/:todoId - END (ERROR) ===");
      serverResponses.sendError(res, messages.BAD_REQUEST, e);
    });
});

  //it's a prefix before api it is useful when you have many modules and you want to
  //differentiate b/w each module you can use this technique
  app.use("/api", router);
};
module.exports = routes;