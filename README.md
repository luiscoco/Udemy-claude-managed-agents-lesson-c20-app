# C20 · Custom Tools: When the Host Answers

Executes a real local read-only task lookup against seeded records; no business mutation or external service call occurs. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Strict custom-tool input
- Host-owned user identity
- Correlate the result event

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3020`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3020
```

## How the app was build

### 1. Validate the registered custom-tool contract

Only lookup_task with a task_N identifier is admitted. Schema validation happens before the host-owned record lookup.

Source: [src/lesson.ts](src/lesson.ts#L13)

```typescript
if (
  text(input, "tool") !== "lookup_task" ||
  !/^task_[0-9]+$/.test(text(input, "taskId"))
)
  return report("rejected", "Tool name or input schema is invalid", {}, [
    "Dispatch only a registered tool",
    "Validate before querying",
  ]);
```

### 2. Apply ownership during lookup

The seeded records include another user’s task. Matching both task ID and the fixed demo principal prevents that record from being returned merely because its ID is known.

Source: [src/lesson.ts](src/lesson.ts#L14) · selected statements

```typescript
const records = [
  { id: "task_1", owner: "demo-user", title: "Review Aurora" },
  { id: "task_2", owner: "other-user", title: "Private task" },
];

const task = records.find(
  (t) => t.id === text(input, "taskId") && t.owner === "demo-user",
);

if (!task)
  return report(
    "rejected",
    "Task is unavailable to the host's demo principal",
    {},
    ["Use server-owned identity", "Filter ownership in the lookup"],
  );
```

### 3. Correlate the custom-result plan

The selected task is wrapped in user.custom_tool_result with custom_tool_use_id. This is a local result envelope; the sample does not dispatch it to a remote session.

Source: [src/lesson.ts](src/lesson.ts#L17)

```typescript
return report(
  "passed",
  "Returned the owned task through a custom-result plan",
  {
    title: task.title,
    result: {
      type: "user.custom_tool_result",
      custom_tool_use_id: "sevt_lookup",
      content: task,
    },
  },
  [
    "Validate the request",
    "Query the authenticated owner's task list",
    "Bind the result to the request event ID",
  ],
);
```

### Check your understanding

Run **Look up an owned task** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "tool": "lookup_task",
    "taskId": "task_1"
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "title": "Review Aurora"
  }
}
```

Then try **Reject a foreign task**. Its expected outcome is `rejected`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
