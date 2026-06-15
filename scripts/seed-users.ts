const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");

type SeedUser = {
  username: "admin" | "deck" | "engine";
  role: "admin" | "deck" | "engine";
};

const users: SeedUser[] = [
  { username: "admin", role: "admin" },
  { username: "deck", role: "deck" },
  { username: "engine", role: "engine" },
];

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = "12345";
const emailDomain = process.env.NEXT_PUBLIC_USERNAME_EMAIL_DOMAIN ?? "navdash.local";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(email: string) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });

    if (error) {
      throw error;
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

    if (match) {
      return match;
    }

    if (data.users.length < 100) {
      return null;
    }

    page += 1;
  }
}

async function upsertUser(seedUser: SeedUser) {
  const email = `${seedUser.username}@${emailDomain}`;
  const existingUser = await findUserByEmail(email);

  const userResult = existingUser
    ? await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
        user_metadata: {
          username: seedUser.username,
          role: seedUser.role,
        },
      })
    : await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username: seedUser.username,
          role: seedUser.role,
        },
      });

  if (userResult.error) {
    throw userResult.error;
  }

  const user = userResult.data.user;

  if (!user) {
    throw new Error(`Supabase did not return a user for ${email}.`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username: seedUser.username,
      full_name: `${seedUser.username[0].toUpperCase()}${seedUser.username.slice(1)} User`,
      role: seedUser.role,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  return { email, id: user.id, role: seedUser.role };
}

async function main() {
  const seeded = [];

  for (const user of users) {
    seeded.push(await upsertUser(user));
  }

  console.table(seeded);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
