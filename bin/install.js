#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.join(__dirname, '..', 'skills');
const destDir = process.cwd();

async function getSkills() {
  const entries = await fs.promises.readdir(skillsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

async function copySkill(skillName, destination) {
  const source = path.join(skillsDir, skillName);
  const dest = path.join(destination, '.agents', 'skills', skillName);

  process.stdout.write(`✓ Installing ${skillName}...\n`);
  await copyDir(source, dest);
}

async function main() {
  try {
    console.log('\n🚀 Agents Skills Installer\n');

    const availableSkills = await getSkills();

    if (availableSkills.length === 0) {
      console.log('❌ No skills found');
      process.exit(1);
    }

    // Seleção com checkboxes
    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'skills',
        message: '📦 Select skills to install:',
        choices: availableSkills.map((skill) => ({
          name: skill,
          value: skill,
        })),
        validate: (answer) => {
          return answer.length > 0 || 'You must select at least one skill';
        },
      },
    ]);

    const selectedSkills = answers.skills;

    console.log(`\n📥 Installing ${selectedSkills.length} skill(s) to ${destDir}\n`);

    for (const skill of selectedSkills) {
      await copySkill(skill, destDir);
    }

    console.log('\n✅ Installation complete!\n');
    console.log('Your skills have been installed to: .agents/skills/\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
