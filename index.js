const { App } = require('@slack/bolt');
const store = require('./store');

var mitsu_counter = {};

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});


app.event('app_home_opened', ({ event, say }) => {  
  // Look up the user from DB
  let user = store.getUser(event.user);
  
  if(!user) {
    user = {
      user: event.user,
      channel: event.channel
    };
    store.addUser(user);
    
    say(`Hello world, and welcome <@${event.user}>!`);
  } else {
    say('Hi again!');
  }
});

// "knock knock" を含むメッセージをリスニングし、 "who's there?" というメッセージをイタリック体で送信
app.message('knock knock', async ({ message, say }) => {
  await say(`_Who's there?_`);
});

// メンションを受け取り、発言内容に合わせて機能を実行
app.event('app_mention', async ({ event, say }) => {
  var userID = event.text.match(/^<.{0,15}>/g);
  var ID1 = userID[0];
  var plaintext = event.text.replace(ID1, "").trim();
  var flag = false;
  try{
    userID = plaintext.match(/^<.{0,15}>/g);
    var ID2 = userID[0];
    plaintext = plaintext.replace(ID2, "").trim();
    flag = true;
  }
  catch(e){
    // await say(ID1);
  }
  if (plaintext == '密です'){
    if(!flag) var ID2 = '<@'+event.user+'>';
    // ユーザーが登録済みか確認
    if(mitsu_counter[ID2]) mitsu_counter[ID2] += 1;
    else mitsu_counter[ID2] = 1;
    
    say(`${ID2} 密です！`);
    say('count is ->'+mitsu_counter[ID2]);
  }
  // countが送られた時
  else if (plaintext == 'count'){
    if(flag){
      if(mitsu_counter[ID2]) {
        await say(`${ID2} 's count is ` + mitsu_counter[ID2] + '!');
      }
      else {
        await say(`${ID2} 's count is _0_ !`);
      }
    }
    else{
      if(mitsu_counter['<@'+event.user+'>']) await say(`<@${event.user}> 's count is ` + mitsu_counter['<@'+event.user+'>'] +`!`);
      else await say(`<@${event.user}> 's count is _0_ !`);
    }
  }
  // deleteが送られた時
  else if (plaintext == 'delete'){
    if(flag){
      delete mitsu_counter[ID2];
      await say(`${ID2}'s counter is deleted!`);
    }
    else{
      delete mitsu_counter['<@'+event.user+'>'];
      await say(`<@${event.user}>'s counter is deleted!`);
    }
  }
  else{
    await say(`<@${event.user}> said \'` + plaintext + '\' right?');
  }
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();

