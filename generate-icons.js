#!/usr/bin/env node

/**
 * Icon Generator Script
 * Generates PNG icons from base64 encoded data
 * Run: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Simple shield icon in base64 PNG format for different sizes
// These are basic placeholder icons - you can replace with better designs

// 16x16 icon (base64)
const icon16Base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAABjklEQVR4nKWTPUsDQRCGn9m9XBKNRrCwsBELQbDRH2BhYWVnZWNhYWGhhYWFhYWNjY2NlZWVlYWFhRYWFhYWFhb+AEGw0ELBwkIQEj/uzs7MXpKbJCriwrLLvs+8M7OzYv+UIiJgjAEARMQYg4jgnENEUEpRliUigjGGsiwxxlAUBUVRUBQFRVFgjKEoCsqypCxLRIRpmqYppSillKaUUnNzc5pSSs3Pz2tKKU0ppZRSSikl1tfX1fb2tlpfX1eLi4tqaWlJra6uqpWVFbW0tKQ2NjbU5uamWl1dVevr62pra0ttb2+rjY0Ntbm5qba2ttTOzo7a3d1Ve3t7an9/Xx0cHKjDw0N1dHSkTk5O1OnpqTo7O1Pn5+fq4uJCXV5eqqurK3V9fa1ubm7U7e2tur+/Vw8PD+rx8VE9PT2p5+dn9fLyol5fX9Xb25t6f39XHx8f6vPzU319fan39/fq+/tbfX19KWOMSimlKaWUppRSmlJKaUopRVEUiAgigjEGEcEYg1IKpRRlWSIiGGNQSuGcQynFH3lVmks4y9LTAAAAAElFTkSuQmCC';

// 48x48 icon (base64)
const icon48Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADj0lEQVR4nO2ZS2gTURSGv3MnmTRpbW2tPlBEEEVx4UJBRRBcuHLhwo0rd+5cuHDhQnDhQkVwpQsXLly4cKHgQkEQxZWCCxcqKoqKj4qKWh+1SZrMzLlymjRNk0ySJjOJ5YfAJJm59/znP+fce+8I/7OklBIRQQhBURSICEopRARjDEVRYIzBGIOIUBQFxhiMMRRFQVEUGGMoigJjDEVRYIyhKAqKoqAoCowxFEWBUkpRFAXGGIwxiAjGGJRSKKUwxiAiGGMQEYwxKKUQEYwxKKUQEZRSiAjGGEQE59w/pZTSOed0zjmtlNI557TWWimltVJKK6W0UkprpZRWSmmllNZKKa2U0loppZVSWiultFZKaaWU1koprc+fP6/Pnz+vz58/r8+fP6/Pnz+vz58/r9fW1vTa2ppeW1vTa2trem1tTZ8/f16vr6/r9fV1vb6+rtfX1/X6+rq+ePGivnjxol5ZWdErKyt6eXlZLy8v66WlJb20tKQXFxf14uKiXlhY0AsLC3p+fl7Pz8/rubk5PTc3p2dnZ/Xs7KyemZnRMzMzenp6Wk9PT+upqSk9NTWlJycn9eTkpJ6YmNATExN6fHxcj4+P67GxMT02NqZHR0f16OioHhkZ0SMjI3p4eFgPDw/roaEhPTQ0pAcHB/Xg4KAeGBjQAwMDun9/X/fv7+u+vj7d19en9+3bp/fu3at7e3t1b2+v7unp0T09Pbq7u1t3d3frrq4u3dXVpTs7O3VnZ6fu6OjQHR0dur29Xbe3t+u2tjbd1tam9+zZo/fs2aNbW1t1a2urbmlp0S0tLbq5uVk3Nzfr3bt3692fd+ndu3fr5uZm3dTUpJuamnRjY6NubGzUu3bt0rt27dI7d+7UO3fu1Dt27NA7duzQO3bs0Dt27NBNjU26qalJ79ixQzc1NemGhgbd0NCgGxoadH19va6vr9d1dXW6rq5O19bW6traWl1TU6Nramr09u3b9fbt23VtTa2ura3V27Zt09u2bdNbt27VW7du1Vu2bNFbtmzRW7Zs0Vu2bNGbN2/WmzZt0ps3b9abNm3SmzZt0ps2bdIbN27UGzdu1Bs2bNAbNmzQGzZs0OvXr9fr16/X69at0+vWrdNr167Va9eu1WvWrNFr1qzRq1ev1qtXr9arVq3Sq1at0itXrtQrV67UK1as0CtWrNDLly/Xy5cv18uWLdPLli3TS5cu1UuXLtVLlizRS5Ys0YsXL9aLFy/WixYt0osWLdILFy7UCxcu1PPz83p+fl4vWLBALViwQC1YsEDNz8+r+fl5NT8/r+bn5//vkvof+wutMCzu7eKaRQAAAABJRU5ErkJggg==';

// 128x128 icon (base64)
const icon128Base64 = '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';

const iconsDir = path.join(__dirname, 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Write icon files
const icons = [
  { name: 'icon16.png', data: icon16Base64 },
  { name: 'icon48.png', data: icon48Base64 },
  { name: 'icon128.png', data: icon128Base64 }
];

console.log('Generating icon files...\n');

icons.forEach(icon => {
  const filePath = path.join(iconsDir, icon.name);
  const buffer = Buffer.from(icon.data, 'base64');
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ Created ${icon.name} (${buffer.length} bytes)`);
});

console.log('\n✓ All icons generated successfully!');
console.log('\nNote: These are placeholder icons.');
console.log('For better quality icons, use icons/generate-icons.html');
console.log('or convert icons/icon.svg using ImageMagick.');
