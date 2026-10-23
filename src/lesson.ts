import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 20,
  title: "Custom Tools: When the Host Answers",
  description: "Your application may already know how to query an internal task list or call a service using host credentials. A custom tool lets the remote agent request that operation without receiving your application code or secrets.",
  concepts: ["Strict custom-tool input", "Host-owned user identity", "Correlate the result event"],
  scope: "Executes a real local read-only task lookup against seeded records; no business mutation or external service call occurs. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Look up an owned task", "input": {"tool": "lookup_task", "taskId": "task_1"}, "expected": "passed", "checks": {"title": "Review Aurora"}}, {"id": "1", "label": "Reject a foreign task", "input": {"tool": "lookup_task", "taskId": "task_2"}, "expected": "rejected", "checks": {}}, {"id": "2", "label": "Reject an unknown tool", "input": {"tool": "delete_task", "taskId": "task_1"}, "expected": "rejected", "checks": {}}],
  async run(input) {

if(text(input,"tool")!=="lookup_task"||!/^task_[0-9]+$/.test(text(input,"taskId")))return report("rejected","Tool name or input schema is invalid",{},["Dispatch only a registered tool","Validate before querying"]);
const records=[{id:"task_1",owner:"demo-user",title:"Review Aurora"},{id:"task_2",owner:"other-user",title:"Private task"}];
const task=records.find(t=>t.id===text(input,"taskId")&&t.owner==="demo-user");
if(!task)return report("rejected","Task is unavailable to the host's demo principal",{},["Use server-owned identity","Filter ownership in the lookup"]);
return report("passed","Returned the owned task through a custom-result plan",{title:task.title,result:{type:"user.custom_tool_result",custom_tool_use_id:"sevt_lookup",content:task}},["Validate the request","Query the authenticated owner's task list","Bind the result to the request event ID"]);

  }
};
