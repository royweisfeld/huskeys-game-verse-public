/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

type Env = {
  DB: D1Database;
  SLACK_WEBHOOK_URL?: string;
};

function isLinearIssueDoneEvent(event: unknown): event is {
  type: string;
  action: string;
  data: {
    state?: { name?: string };
    assignee?: { name?: string };
    estimate?: number;
    title?: string;
    priority?: string;
    priorityLabel?: string;
  };
} {
  return (
    typeof event === 'object' && event !== null &&
    (event as Record<string, unknown>).type === 'Issue' &&
    (event as Record<string, unknown>).action === 'update' &&
    typeof (event as Record<string, unknown>).data === 'object' &&
    (event as Record<string, unknown>).data !== null
  );
}

// Fun level names
function getLevelName(level: number): string {
  if (level >= 11) return "God Mode";           // reality: patched; you: un-patched
  if (level === 10) return "Root Overlord";     // sudo -s? pfft … you ARE sudo
  if (level === 9)  return "Zero-Day Dragon";   // breathing fire on unpatched stacks
  if (level === 8)  return "Kernel Kraken";     // tentacles in ring-0
  if (level === 7)  return "Exploit Unicorn";   // rare, majestic, remote-code-exec
  if (level === 6)  return "Packet Ninja";      // silent but deadly on the wire
  if (level === 5)  return "Firewall Ferret";   // squeezing through every rule gap
  if (level === 4)  return "Crypto Cat";        // purring over perfect forward secrecy
  if (level === 3)  return "Payload Pixie";     // sprinkling shellcode like fairy dust
  if (level === 2)  return "Log Goblin";        // rummaging for tasty IOCs
  if (level === 1)  return "Script Kiddie";     // copy-paste, cross fingers
  return "Boot-Sector Gremlin";                 // still figuring out where BIOS lives
}

// Priority XP multipliers
function getPriorityMultiplier(priority: string | undefined): number {
  if (!priority) return 1;
  switch (priority.toLowerCase()) {
    case "urgent": return 2.5;
    case "high": return 2;
    case "medium": return 1.5;
    case "low": return 1;
    case "no priority": return 1;
    default: return 1;
  }
}

// Map Linear numeric priority to string label
function getPriorityLabel(priority: number | string | undefined): string {
  switch (Number(priority)) {
    case 4: return "Low";
    case 3: return "Medium";
    case 2: return "High";
    case 1: return "Urgent";
    case 0:
    default: return "No priority";
  }
}

// Types for DB rows
interface AchievementRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  target: number;
  timeframe_days: number | null;
}
interface UserAchievementRow {
  achievement_id: string;
}

// Helper for CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request: Request, env: Env, ctx: unknown): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (request.method === "GET" && url.pathname === "/") {
      return new Response("Gamification backend is running!");
    }

    // Handle CORS preflight for all /api/* endpoints
    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { headers: corsHeaders });
    }

    // Linear webhook endpoint
    if (request.method === "POST" && url.pathname === "/api/linear-webhook") {
      let event: unknown;
      try {
        event = await request.json();
      } catch (e) {
        return new Response("Invalid JSON", { status: 400 });
      }

      if (isLinearIssueDoneEvent(event)) {
        const issue = event.data as {
          id?: string;
          state?: { name?: string };
          assignee?: { name?: string };
          estimate?: number;
          title?: string;
          priority?: string | number;
          priorityLabel?: string;
        };
        if (issue.state && issue.state.name === "Done") {
          const taskId = issue.id;
          if (!taskId) {
            return new Response("No task ID found", { status: 400 });
          }
          // Check if this task has already been processed
          const alreadyProcessed = await env.DB.prepare(
            "SELECT 1 FROM processed_tasks WHERE id = ?"
          ).bind(taskId).first();
          if (alreadyProcessed) {
            return new Response("Task already processed", { status: 200 });
          }
          // Mark this task as processed
          // Prefer a human-readable ticket identifier if available
          const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
          const assignee = issue.assignee?.name || "Unknown";
          const baseXp = issue.estimate || 50;
          const priorityValue = typeof issue.priority === "number"
            ? issue.priority
            : Number(issue.priority) || 0;
          const priorityLabel = getPriorityLabel(priorityValue);
          const multiplier = getPriorityMultiplier(priorityLabel);
          let xpReward = Math.round(baseXp * multiplier);

          // CTO Special Task detection and double XP
          let isCtoSpecial = false;
          if (issue.title && issue.title.startsWith("CTO Special Task - ")) {
            isCtoSpecial = true;
            xpReward *= 2; // Double XP for CTO Special
          }

          await env.DB.prepare(
            "INSERT INTO processed_tasks (id, title, assignee, completed_at, xp_reward) VALUES (?, ?, ?, ?, ?)"
          ).bind(taskId, issue.title || null, issue.assignee?.name || null, today, xpReward).run();


          // 1. Get current XP
          let xp = 0;
          let level = 1;
          try {
            const selectRes = await env.DB.prepare(
              "SELECT xp FROM employees WHERE id = ?"
            ).bind(assignee).first();
            if (selectRes && typeof selectRes.xp === 'number') {
              xp = selectRes.xp;
            }
            xp += xpReward;
            // XP/Level calculation (prestige scaling)
            function xpForLevel(level: number): number {
              // Example: 500 * level^1.5, rounded
              return Math.round(500 * Math.pow(level, 1.5));
            }
            // Find current level based on total XP
            let tempLevel = 1;
            let xpSum = 0;
            while (xp >= xpSum + xpForLevel(tempLevel)) {
              xpSum += xpForLevel(tempLevel);
              tempLevel++;
            }
            level = tempLevel;
            const levelName = getLevelName(level);
            const nextLevelXp = xpSum + xpForLevel(level);
            const xpToNext = nextLevelXp - xp;

            // 2. Upsert employee
            const upsertResult = await env.DB.prepare(
              `INSERT INTO employees (id, name, xp, level)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET xp = ?, level = ?`
            ).bind(assignee, assignee, typeof xp === 'number' ? xp : 0, typeof level === 'number' ? level : 1, typeof xp === 'number' ? xp : 0, typeof level === 'number' ? level : 1).run();

            // 2.5. Award achievements
            // Count total tasks completed by this user
            const countResult = await env.DB.prepare(
              `SELECT COUNT(*) as count FROM processed_tasks WHERE assignee = ?`
            ).bind(assignee).first() as { count: number } | undefined;
            const userTasksCompleted = countResult?.count ?? 0;
            // Get all achievements
            const { results: allAchievements } = await env.DB.prepare(
              `SELECT * FROM achievements`
            ).all() as { results: AchievementRow[] };
            // Get already unlocked achievements for this user
            const { results: unlocked } = await env.DB.prepare(
              `SELECT achievement_id FROM user_achievements WHERE user_id = ?`
            ).bind(assignee).all() as { results: UserAchievementRow[] };
            const unlockedIds = new Set(unlocked.map((row) => row.achievement_id));
            // Check and award task, level, and XP/time achievements
            for (const ach of allAchievements) {
              let qualifies = false;
              if (ach.type === 'tasks') {
                if (userTasksCompleted >= Number(ach.target)) qualifies = true;
              } else if (ach.type === 'level') {
                if (level >= Number(ach.target)) qualifies = true;
              } else if (ach.type === 'xp' && ach.timeframe_days) {
                // Sum XP earned in the last N days
                // Not implemented: would need a per-task XP log with timestamps
              } else if (ach.type === 'streak' && ach.timeframe_days) {
                // Streak achievement: check for N consecutive workdays with completions
                function isWorkday(date: Date) {
                  // 0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday
                  const day = date.getUTCDay();
                  return day !== 5 && day !== 6; // Not Friday (5) or Saturday (6)
                }
                async function getStreak(assignee: string, days: number): Promise<number> {
                  const { results: completions } = await env.DB.prepare(
                    `SELECT completed_at FROM processed_tasks WHERE assignee = ? AND completed_at IS NOT NULL ORDER BY completed_at DESC`
                  ).bind(assignee).all() as { results: { completed_at: string }[] };
                  const dateSet = new Set(completions.map(row => row.completed_at));
                  let streak = 0;
                  const currentDate = new Date(today);
                  while (true) {
                    const iso = currentDate.toISOString().slice(0, 10);
                    if (dateSet.has(iso)) {
                      streak++;
                    } else if (isWorkday(currentDate)) {
                      break;
                    }
                    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
                  }
                  return streak;
                }
                const streak = await getStreak(assignee, ach.target);
                if (streak >= Number(ach.target)) qualifies = true;
              } else if (ach.type === 'cto_special') {
                // CTO Special achievement: unlock if this is a CTO Special task
                if (isCtoSpecial) qualifies = true;
              }
              if (qualifies && !unlockedIds.has(ach.id)) {
                await env.DB.prepare(
                  `INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`
                ).bind(assignee, ach.id).run();
                // Send Slack notification for new achievement
                if (env.SLACK_WEBHOOK_URL) {
                  const achievementMessage = `${ach.icon} *${assignee}*, congratulations! You've unlocked the *${ach.name}* achievement! 🎉`;
                  await fetch(env.SLACK_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      text: achievementMessage
                    }),
                  });
                }
              }
            }

            // Calculate current streak (consecutive workdays with completions)
            async function calculateCurrentStreak(assignee: string): Promise<number> {
              const { results: completions } = await env.DB.prepare(
                `SELECT completed_at FROM processed_tasks WHERE assignee = ? AND completed_at IS NOT NULL ORDER BY completed_at DESC`
              ).bind(assignee).all() as { results: { completed_at: string }[] };
              const dateSet = new Set(completions.map(row => row.completed_at));
              let streak = 0;
              const currentDate = new Date(today);
              function isWorkday(date: Date) {
                const day = date.getUTCDay();
                return day !== 5 && day !== 6; // Not Friday (5) or Saturday (6)
              }
              while (true) {
                const iso = currentDate.toISOString().slice(0, 10);
                if (dateSet.has(iso)) {
                  streak++;
                } else if (isWorkday(currentDate)) {
                  break;
                }
                currentDate.setUTCDate(currentDate.getUTCDate() - 1);
              }
              return streak;
            }

            // Calculate max streak
            async function calculateMaxStreak(assignee: string): Promise<number> {
              const { results: completions } = await env.DB.prepare(
                `SELECT completed_at FROM processed_tasks WHERE assignee = ? AND completed_at IS NOT NULL ORDER BY completed_at ASC`
              ).bind(assignee).all() as { results: { completed_at: string }[] };
              if (completions.length === 0) return 0;
              let maxStreak = 0;
              let streak = 0;
              let prevDate: Date | null = null;
              function isWorkday(date: Date) {
                const day = date.getUTCDay();
                return day !== 5 && day !== 6;
              }
              for (const row of completions) {
                const date = new Date(row.completed_at);
                if (prevDate) {
                  const nextDate = new Date(prevDate);
                  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
                  // Skip non-workdays
                  while (!isWorkday(nextDate) && nextDate < date) {
                    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
                  }
                  if (date.getTime() === nextDate.getTime()) {
                    streak++;
                  } else {
                    streak = 1;
                  }
                } else {
                  streak = 1;
                }
                if (streak > maxStreak) maxStreak = streak;
                prevDate = date;
              }
              return maxStreak;
            }

            // Update streak columns in employees table
            const currentStreak = await calculateCurrentStreak(assignee);
            const maxStreak = await calculateMaxStreak(assignee);
            await env.DB.prepare(
              `UPDATE employees SET current_streak = ?, max_streak = ? WHERE id = ?`
            ).bind(currentStreak, maxStreak, assignee).run();

            // 3. Increment completions counter
            await env.DB.prepare(
              "UPDATE completions SET count = count + 1 WHERE id = 1"
            ).run();
            const completionsRow = await env.DB.prepare(
              "SELECT count FROM completions WHERE id = 1"
            ).first() as { count: number | string | null } | undefined;
            let completionsCount = 0;
            if (completionsRow && completionsRow.count != null) {
              if (typeof completionsRow.count === 'number') completionsCount = completionsRow.count;
              else if (typeof completionsRow.count === 'string') completionsCount = Number(completionsRow.count);
            }

            // 4. Send Slack notification with new level (only if upsert succeeded)
            if (env.SLACK_WEBHOOK_URL) {
              const slackRes = await fetch(env.SLACK_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: `🎉 ${assignee} completed "${issue.title}" and earned ${xpReward} XP! Now level ${level} (${levelName}). Current XP: ${xp}/${nextLevelXp} (${xpToNext} XP to next level.)`
                }),
              });
              console.log("Slack response status:", slackRes.status);

              // 5. Every 10 completions, send leaderboard
              if (completionsCount % 10 === 0) {
                const { results: leaderboard } = await env.DB.prepare(
                  "SELECT name, xp, level FROM employees ORDER BY xp DESC LIMIT 3"
                ).all();
                const leaderboardText = (leaderboard as { name: string; xp: number; level: number }[])
                  .map((row, i) =>
                    `*${i + 1}. ${row.name}* — ${row.xp} XP (Level ${row.level})`
                  )
                  .join('\n');
                await fetch(env.SLACK_WEBHOOK_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    text: `:trophy: *Leaderboard (Top 3)* :trophy:\n${leaderboardText}`
                  }),
                });
              }
            }
          } catch (err) {
            console.log("Error during upsert or Slack notification:", err);
            return new Response("Error updating XP/level", { status: 500 });
          }
        }
      }
      return new Response("OK", { status: 200 });
    }

    // Slack slash command endpoint
    if (request.method === "POST" && url.pathname === "/api/slack/command") {
      const form = await request.formData();
      const command = form.get("command");
      const userId = form.get("user_id");
      const userName = form.get("user_name");

      if (command === "/leaderboard") {
        const { results: leaderboard } = await env.DB.prepare(
          "SELECT name, xp, level FROM employees ORDER BY xp DESC LIMIT 10"
        ).all();
        const leaderboardText = (leaderboard as { name: string; xp: number; level: number }[])
          .map((row: { name: string; xp: number; level: number }, i: number) =>
            `*${i + 1}. ${row.name}* — ${row.xp} XP (Level ${row.level} - ${getLevelName(row.level)})`
          )
          .join('\n');
        return new Response(JSON.stringify({
          response_type: "ephemeral",
          text: `:trophy: *Leaderboard (Top 10)* :trophy:\n${leaderboardText}`
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      if (command === "/level") {
        // Try exact match
        let row = await env.DB.prepare(
          "SELECT xp, level, id FROM employees WHERE id = ?"
        ).bind(userName).first();
        // If not found, try case-insensitive match
        if (!row) {
          row = await env.DB.prepare(
            "SELECT xp, level, id FROM employees WHERE LOWER(id) = LOWER(?)"
          ).bind(userName).first();
        }
        // If still not found, try partial match
        if (!row) {
          row = await env.DB.prepare(
            "SELECT xp, level, id FROM employees WHERE LOWER(id) LIKE LOWER(?) LIMIT 1"
          ).bind(`%${userName}%`).first();
        }
        if (row) {
          return new Response(JSON.stringify({
            response_type: "ephemeral",
            text: `*${row.id}* — ${row.xp} XP (Level ${row.level} - ${getLevelName(row.level)})`
          }), {
            headers: { "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({
          response_type: "ephemeral",
          text: `No employee found with ID *${userName}*`
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Public leaderboard API endpoint
    if (request.method === "GET" && url.pathname === "/api/leaderboard") {
      const { results: leaderboard } = await env.DB.prepare(
        "SELECT name, xp, level FROM employees ORDER BY xp DESC LIMIT 10"
      ).all();
      return new Response(JSON.stringify(leaderboard), { headers: corsHeaders });
    }

    // Public achievements API endpoint
    if (request.method === "GET" && url.pathname === "/api/achievements") {
      // Get all achievements
      const { results: achievements } = await env.DB.prepare(
        `SELECT * FROM achievements`
      ).all() as { results: AchievementRow[] };
      // For each achievement, get users who unlocked it
      for (const ach of achievements) {
        const { results: users } = await env.DB.prepare(
          `SELECT user_id FROM user_achievements WHERE achievement_id = ?`
        ).bind(ach.id).all() as { results: { user_id: string }[] };
        (ach as AchievementRow & { users: string[] }).users = users.map((u) => u.user_id);
      }
      return new Response(JSON.stringify(achievements), { headers: corsHeaders });
    }

    // Public levels API endpoint
    if (request.method === "GET" && url.pathname === "/api/levels") {
      const { results: levels } = await env.DB.prepare(
        "SELECT level, name, xp_required FROM levels ORDER BY level ASC"
      ).all();
      return new Response(JSON.stringify(levels), { headers: corsHeaders });
    }

    // Top monthly XP earners API endpoint
    if (request.method === "GET" && url.pathname === "/api/top-monthly-xp") {
      // Get the first day of the current month in YYYY-MM-DD
      const now = new Date();
      const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
      // Join processed_tasks with employees on assignee = employees.id
      const { results: tasks } = await env.DB.prepare(
        `SELECT e.name, SUM(pt.xp_reward) as xp_earned
         FROM processed_tasks pt
         JOIN employees e ON pt.assignee = e.id
         WHERE pt.completed_at >= ?
         GROUP BY e.name
         ORDER BY xp_earned DESC
         LIMIT 10`
      ).bind(firstOfMonth).all();
      return new Response(JSON.stringify(tasks), { headers: corsHeaders });
    }
    return new Response("Not found", { status: 404 });
  }
};