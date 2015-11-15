# Banerelle

## Environment Setup

**You must have PHP installed locally.**

1. Run `composer install`
2. Setup Environtment Variables: `cp .env.example .env`
3. PROD: Run migrations: `vendor/bin/phinx migrate`
3. [Run migrations: `vagrant ssh`, `cd /vagrant`, `bin/phinx migrate`]
4. Start PHP server: `npm run start`
5. Visit [http://localhost:8080](http://localhost:8080), you should see something
