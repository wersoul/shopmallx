import crypto from 'crypto';

function hash(pw) {
  const salt = crypto.randomBytes(16);
  const der = crypto.pbkdf2Sync(pw, salt, 100000, 32, 'sha256');
  return 'pbkdf2$100000$' + salt.toString('hex') + '$' + der.toString('hex');
}

console.log('admin:', hash('admin1234'));
console.log('demo:', hash('12345678'));