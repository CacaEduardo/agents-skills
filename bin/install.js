#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.join(__dirname, '..', 'skills');
const destDir = process.cwd();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

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

  console.log(`✓ Installing ${skillName}...`);
  await copyDir(source, dest);
}

async function selectSkills(availableSkills) {
  console.log('\n📦 Available Claude Skills:\n');
  availableSkills.forEach((skill, index) => {
    console.log(`  ${index + 1}. ${skill}`);
  });

  console.log('\n💡 Select skills to install:');
  console.log('   Enter numbers separated by commas (e.g., 1,3,5)');
  console.log('   Or press Enter to select all\n');

  const answer = await question('Your selection: ');

  if (!answer.trim()) {
    return availableSkills;
  }

  const selected = answer
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s)
    .map((s) => parseInt(s, 10) - 1)
    .filter((idx) => idx >= 0 && idx < availableSkills.length);

  if (selected.length === 0) {
    console.log('❌ Invalid selection');
    return selectSkills(availableSkills);
  }

  return selected.map((idx) => availableSkills[idx]);
}

async function main() {
  try {
    console.log('\n🚀 Claude Skills Installer\n');

    const availableSkills = await getSkills();

    if (availableSkills.length === 0) {
      console.log('❌ No skills found');
      process.exit(1);
    }

    const selectedSkills = await selectSkills(availableSkills);

    console.log(`\n📥 Installing ${selectedSkills.length} skill(s) to ${destDir}\n`);

    for (const skill of selectedSkills) {
      await copySkill(skill, destDir);
    }

    console.log('\n✅ Installation complete!\n');
    console.log('Your skills have been installed to: .agents/skills/\n');

    rl.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
