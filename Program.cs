using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Models;

var builder = WebApplication.CreateBuilder(args);

// Connect SQLite database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=taskmanager.db")
);

var app = builder.Build();

// Create database if it does not exist
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    await db.Database.EnsureCreatedAsync();
}

// Serve HTML, CSS and JavaScript files
app.UseDefaultFiles();
app.UseStaticFiles();

// GET: Get all tasks
app.MapGet("/api/tasks", async (AppDbContext db) =>
{
    var tasks = await db.Tasks
        .OrderByDescending(t => t.Id)
        .ToListAsync();

    return Results.Ok(tasks);
});

// POST: Add a new task
app.MapPost("/api/tasks", async (
    CreateTaskRequest request,
    AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(
            new { message = "Task title is required." }
        );
    }

    var task = new TodoItem
    {
        Title = request.Title.Trim(),
        IsCompleted = false
    };

    db.Tasks.Add(task);

    await db.SaveChangesAsync();

    return Results.Created($"/api/tasks/{task.Id}", task);
});

// PUT: Update a task
app.MapPut("/api/tasks/{id:int}", async (
    int id,
    UpdateTaskRequest request,
    AppDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);

    if (task == null)
    {
        return Results.NotFound();
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(
            new { message = "Task title is required." }
        );
    }

    task.Title = request.Title.Trim();
    task.IsCompleted = request.IsCompleted;

    await db.SaveChangesAsync();

    return Results.Ok(task);
});

// DELETE: Delete a task
app.MapDelete("/api/tasks/{id:int}", async (
    int id,
    AppDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);

    if (task == null)
    {
        return Results.NotFound();
    }

    db.Tasks.Remove(task);

    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();