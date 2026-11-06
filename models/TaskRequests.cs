namespace TaskManager.Models;

public record CreateTaskRequest(string Title);

public record UpdateTaskRequest(
    string Title,
    bool IsCompleted
);