#cc
Automation for cronos.cash

To run on Windows, you should be able to follow the instructions below after installing WSL. Instructions can be found in the Microsoft link below. WSL will install ubuntu and run it in the background. From there you can follow the rest of the installation.

https://learn.microsoft.com/en-us/windows/wsl/install

To run on Linux you will need nodejs of at least version 18. Installation instructions can be found here:
https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

After installing, take note of the location of it using the `which node` command:
```bigonion@theshed:~/projects/cc$ which node
/home/bigonion/.nvm/versions/node/v19.7.0/bin/node```


Once node is installed, clone this repo with:
`git clone https://github.com/bigonionbots/cc.git`
Change to the cloned directory
`cd cc`
Install the required ethers.js package
`npm install`
Rename the `config.json.example` file to `config.json`
`mv config.json.example config.json`
Edit `config.json` and replace the string of "one two three ..." with your 12 word mnemonic. Press Ctrl+O to save, then Ctrl+X to exit.
`nano config.json`
Test the script:
`node cc.js -s`

This should connect to the Cronos blockchain and issue the 'desync' contract function using your mnemonic. You should see something like the following:
```
cronos.cash: syncTKeepers submitted in txn 0x... from 0xYourAddress to 0x024eAd51db58965CC22bdF5d2794371A69593EE9
cronos.cash: receipt received, confirmed in block 736xxxxx, total fee of 0.26251769 CRO
```

To set up the scheduled job, you can use the command `crontab -e`. I would suggest using the following guide for understanding how the cron file works.

https://opensource.com/article/17/11/how-use-cron-linux

Below is my own cron entries:
```
00 12 * * 1 cd /home/bigonion/projects/cc && /home/bigonion/.nvm/versions/node/v19.7.0/bin/node cronos.js -d >> /home/bigonion/projects/cc/cronos.log
00 12 * * 2,3,4,5,6,7 cd /home/bigonion/projects/cc && /home/bigonion/.nvm/versions/node/v19.7.0/bin/node cronos.js -s >> /home/bigonion/projects/cc/cronos.log
```

What this means is every week ...
... on Monday (`1`) ...
... at noon (`00 12`) ... 
... run a command that changes directories (`cd /home/bigonion/projects/cc`) ...
... executes the script to desync (`/.../node cronos.js -d`) ...
... and direct any screen output to a cronos.log file (`>> /home/bigonion/projects/cc/cronos.log`)

The second line is the same but issues it ...
... Tuesday through Sunday (`2, 3, 4, 5, 6, 7`) ...
... and runs the script to sync (`/.../node cronos.js -s`)

The path before node should be exactly where node is installed. You can find this out after installing node by typing
