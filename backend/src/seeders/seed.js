/**
 * Simple seed script: creates one user and one team and adds user as admin.
 * Run: npm run seed
 */

const bcrypt = require('bcrypt');
const models = require('../models');
const generateTeamCode = require('../utils/generateTeamCode');
require('dotenv').config();

async function seed() {
  try {
    await models.sequelize.authenticate();
    await models.sequelize.sync({ alter: true });

    const email = process.env.SEED_EMAIL || 'alice@example.com';
    const name = process.env.SEED_NAME || 'Alice';
    const password = process.env.SEED_PASSWORD || 'Password123';

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // create or find user
    let user = await models.User.findOne({ where: { email } });
    if (!user) {
      user = await models.User.create({ name, email, passwordHash });
      console.log('Created user:', email);
    } else {
      console.log('User already exists:', email);
    }

    // create team
    const teamName = process.env.SEED_TEAM_NAME || 'Demo Team';
    let team = await models.Team.findOne({ where: { name: teamName } });
    if (!team) {
      let code = generateTeamCode(8);
      // ensure unique
      while (await models.Team.findOne({ where: { code } })) {
        code = generateTeamCode(8);
      }
      team = await models.Team.create({ name: teamName, code, createdBy: user.id });
      await models.TeamMember.create({ teamId: team.id, userId: user.id, role: 'admin' });
      console.log('Created team:', teamName, ' code:', code);
    } else {
      console.log('Team already exists:', teamName);
    }

    // create a personal task for user and a team task
    const personalTask = await models.Task.findOne({ where: { title: 'Personal: Welcome task' } });
    if (!personalTask) {
      await models.Task.create({
        title: 'Personal: Welcome task',
        description: 'This is your personal task. You can edit/delete it.',
        userId: user.id,
        createdBy: user.id,
        priority: 'medium'
      });
    }

    const teamTask = await models.Task.findOne({ where: { title: 'Team: Setup board' } });
    if (!teamTask) {
      await models.Task.create({
        title: 'Team: Setup board',
        description: 'Create a couple of tasks to test Kanban.',
        teamId: team.id,
        createdBy: user.id,
        priority: 'high'
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

seed();
