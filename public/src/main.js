let db = firebase.firestore(); // データベースに関する機能の取得

const auth = firebase.auth();
const storage = firebase.storage();

/*
const messaging = firebase.messaging();
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    // 通知を許可した場合
    console.log('Notification permission granted.');

    messaging.getToken({ vapidKey: 'BMvLkgXZAN6xR_UttdcDMgV61ezSQ1QR5xQ7LNjWRTxZ9Xs-PqdHjEuyAnoz587zp_KABiqnNeqvF4IeiyPIOv0' }).then((currentToken) => {
      if (currentToken) {
        // トークン取得成功
        console.log("currentToken:");
        console.log(currentToken);
      } else {
        // トークン取得失敗
        console.log('No registration token available. Request permission to generate one.');
      }
    });
  } else {
    // 通知を拒否した場合
    console.log('Unable to get permission to notify.');
  }
});
*/


//画像をアップロードするメソッド
const OnFileUploadToFirebase = (e) => {
  const file = e.target.files[0];
  const storageRef = storage.ref();
  const imagesRef = storageRef.child('images');
  const spaceRef = storageRef.child('images/' + file.name);

  spaceRef.put(file).then((snapshot) => {
    console.log('Uploaded a blob or file!');
  });
}

//サインアップするメソッド
const register = () => {
  // input要素のtype属性を取得
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  // console.log(email, password);

  // Promiseで、メールとパスワードを渡す必要がある
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((res) => {
      console.log(res.user)
    })

    .catch((err) => {
      alert(err.message)
      console.log(err.code)
      console.log(err.user)
    })
};

//ログインするメソッド
const login = () => {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      auth.onAuthStateChanged((user) => {
        if (user) {
          const uid = user.uid;
          console.log(uid); // uidをコンソールに表示
          //ログインが成功したら登録画面に遷移
          window.location.href = 'state.html';
        }
      });
    })
    .catch((err) => {
      // ダイアログが表示されるようにする
      alert(err.message);
      console.log(err.code);
      console.log(err.user);
    });
}

//ログアウトするメソッド
const logout = () => {
  const user1 =auth.currentUser;
  console.log('サインアウト前:',user1);
    auth.signOut()
    .then(() => {
      const user2 = auth.currentUser;
      console.log('サインアウト後:',user2);
    })
}

//教科書情報を登録するメソッド
const book_register = () => {
  const user = firebase.auth().currentUser;
  const subjectName = document.getElementById("subject").value;
  const textbookName = document.getElementById("textbook").value;
  const textbookImage = document.getElementById("textbookImage").files[0];

  const storageRef = storage.ref();
  const imagesRef = storageRef.child('images');
  const spaceRef = storageRef.child('images/' + textbookImage.name);

  //教科書写真のアップロード
  spaceRef.put(textbookImage).then((snapshot) => {
    console.log('Uploaded a blob or file!');
    //アップロードが完了したら、Firestoreにデータ保存
    spaceRef.getDownloadURL().then((imageUrl) => {
      db.collection("registrations")
        .add({
          subjectName: subjectName,
          textbookName: textbookName,
          userEmail: user.email,
          textbookImage: imageUrl
        })
        .then(() => {
          console.log("Document successsfully written");
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    }).catch((error) => {
      console.error("画像URL取得エラー", error)
    });
  });

  /*db.collection("registrations")
    .add({
      subjectName: subjectName,
      textbookName: textbookName,
      userEmail: user.email
    })
    .then(() => {
      console.log("Document successsfully written");
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });*/
}

//教科書を探すメソッド
const search = () => {
  const subjectName = document.getElementById("search_subject").value;

  db.collection("registrations").where("subjectName", "==", subjectName)
    .get()
    .then((querySnapshot) => {
      const resultTable = document.getElementById("resultTable");

      //検索結果を一旦クリアする
      resultTable.querySelector("tbody").innerHTML = "";

      querySnapshot.forEach((doc) => {
        const rowData = doc.data();
        //テーブルの行を作成して結果を追加
        const row = document.createElement("tr");
        row.innerHTML = `
              <td>${doc.id}</td>
              <td>${rowData.subjectName}</td>
              <td>${rowData.textbookName}</td>
              <td><img src="${rowData.textbookImage}" alt="Textbook Image"></td>
              <td><button onclick="showConfirmation('${doc.id}')">選択</button></td>
            `;
        resultTable.querySelector("tbody").appendChild(row);

        console.log(doc.id, "=>", doc.data());
      });
    })
    .catch((error) => {
      console.log("Error getting documents", error);
    });
}

// 選択の確認ダイアログを表示する関数
const showConfirmation = (docId) => {
  const confirmDialog = document.getElementById("confirmDialog");
  confirmDialog.style.display = "block"; // ダイアログを表示
  confirmDialog.dataset.docId = docId; // ダイアログにdocIdをデータ属性として設定
}

// 選択確定時の処理
const confirmSelection = () => {
  const confirmDialog = document.getElementById("confirmDialog");
  const docId = confirmDialog.dataset.docId; // ダイアログからdocIdを取得
  confirmDialog.style.display = "none"; // ダイアログを非表示にする

  // 選択確定の処理を行う（ここではアラート表示）
  alert(`選択されたドキュメントID: ${docId}`);
}

// 選択キャンセル時の処理
const cancelSelection = () => {
  const confirmDialog = document.getElementById("confirmDialog");
  confirmDialog.style.display = "none"; // ダイアログを非表示にする
}

//教科書を探すメソッド2
const search_2 = () => {
  document.getElementById('search-form').addEventListener('submit', function (event) {
    //event.preventDefault();

    const subjectName = document.getElementById("search_subject").value;
    console.log('OK');
    db.collection("registrations").where("subjectName", "==", subjectName)
      .get()
      .then((querySnapshot) => {
        //検索結果を取得
        const searchResults = snapshot.val();

        //検索結果を表示する処理
        const resultDiv = document.getElementById('result');
        //結果表示エリアをクリア
        resultDiv.innerHTML = '';

        querySnapshot.forEach((doc) => {
          const rowData = doc.data();

          const textbookName = rowData.textbookName;
          const textbookPhoto = rowData.textbookImage;

          //結果表示エリアに結果を追加
          const resultItem = document.createElement('div');
          resultItem.innerHTML = `
              <h3>${textbookName}</h3>
              <img src="${textbookPhoto}" alt="${textbookName}">
            `;
          resultDiv.appendChild(resultItem);
        });
      })
      .catch((error) => {
        console.log("Error getting documents", error)
      })
    
  });
}

//登録者に貰い手が見つかった通知をする処理
const messagingToRegister = () => {

}

/*
// データをFireStoreに保存するメソッド
const savaData = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  // dbという変数にフォームのデータを入れる
  db.collection("users")
    .add({
      email: email,
      password: password
    })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}

// FireStoreのデータを表示するメソッド
const readData = () => {
  db.collection('users')
    .get()
    .then((data) => {
      console.log(data.docs.map((item) => {
        return { ...item.data(), id: item.id }
      }))
    })
}

//FireStoreのデータを更新するメソッド
const updateData = () => {
  db.collection('users').doc('Gcl9NXVnzfCGkYW4VteB')
    .update({
      email: 'JboySan@gamil.com',
      password: '123456789'
    })
    .then(() => {
      alert('Data Updated')
    })
}

// 保持されている全てのタスクデータを取得し、表示する
function getAll() {
  let collection = db.collection("tasks").orderBy('create_at', 'asc'); // 作成された順にデータを並べてタスクデータをデータベースから取得する
  collection.get().then((querySnapshot) => { // 取得したデータを読み取る
    $('#list').text('') // タスクをリスト表示するための箇所（<div id="list"></div>）を空文字に設定（初期化）

    // 変数の初期化
    outputAll = [];
    num = 0;

    querySnapshot.forEach((doc) => { // 取得したデータそれぞれ1つづつのデータに対して
      let status = "";
      if (doc.data()['done']) {
        status = "checked"
      } // タスクが完了の状態になっているかの判定
      // リスト表示するための箇所（ <div id="list"></div> ）にタスクを最下端に追加
      $('#list').append(' \
  <div class="row mx-auto"> \
    <div class="col-sm"> \
      <form class="form-inline"> \
        <div class="custom-control custom-checkbox"> \
          <input value="' + doc.id + '" type="checkbox" class="custom-control-input" id="customCheck' + num +
        '" ' + status + ' onclick="check(this);"> \
          <label class="custom-control-label" for="customCheck' + num + '"> \
            <p>' + doc.data()['name'] + '\
              [<a value="' + doc.id + '" data-toggle="modal" data-target="#editModal" onclick="showEditModal(this)"> <span class="fontBlue">edit</span> </a>] \
              [<a value="' + doc.id + '" data-toggle="modal" data-target="#editModal" onclick="showDeleteModal(this)"> <span class="fontRed">x</span> </a>] \
            </p> \
          </label> \
        </div> \
      </form> \
    </div> \
  </div>');
      num++;
    });
  });
}
//getAll(); // 保持されている全てのタスクデータ取得の初期実行（これがないと、画面を開いたときに何も表示されない）

// タスクを追加する
function add() {
  let taskNameForAdd = $("#taskNameForAdd").val(); // inputbox に入力された値を取得する
  if (taskNameForAdd == "") return; // もし、inputbox が空だった場合は関数を終了する

  db.collection("tasks").add({ // データベースにタスクを追加する
    name: taskNameForAdd, // 入力されたタスク名
    done: false, // タスクの完了状態は最初は未の状態のため false を指定
    create_at: new Date() // 現在時刻
  }).then(function (docRef) { // 成功した場合に実行される箇所
    getAll(); // 保持されている全てのタスクデータを取得し、表示する
    $("#taskNameForAdd").val(''); // inputbox に入力された値を空にする
    console.log("Document written with ID: ", docRef.id);
  })
    .catch(function (error) { // 失敗した場合に実行される箇所
      console.error("Error adding document: ", error);
    });
}

// タスクを削除する
function del() {
  db.collection("tasks").doc($('#docId').val()).delete() // $('#docId').val() で削除する対象データのIDを取得し、そのデータに対して削除を行う
    .then(function () { // 成功した場合に実行される箇所
      console.log("Document successfully deleted!");
      $('#list').text = "" // タスクをリスト表示するための箇所（<div id="list"></div>）を空文字に設定（初期化）
      $("#editModal").modal('toggle'); // Modal の表示を OFF にする
      getAll(); // 保持されている全てのタスクデータを取得し、表示する
    }).catch(function (error) { // 失敗した場合に実行される箇所
      console.error("Error removing document: ", error);
    });
}

// タスクを更新する
function update() {
  let taskNameForEdit = $("#taskNameForEdit").val(); // inputbox に入力された値を取得する
  if (taskNameForEdit == "") return; //　もし、inputbox が空だった場合は関数を終了する

  collection = db.collection("tasks").doc($('#docId').val())
    .update({ // $('#docId').val() で削除する対象データのIDを取得し、そのデータに対して更新を行う
      name: taskNameForEdit, // 入力されたタスク名
    }).then(function () { // 成功した場合に実行される箇所
      console.log("Document successfully updated!");
      $('#list').text = "" // タスクをリスト表示するための箇所（<div id="list"></div>）を空文字に設定（初期化）
      $("#editModal").modal('toggle'); // Modal の表示を OFF にする
      getAll(); // 保持されている全てのタスクデータを取得し、表示する
      $("#taskNameForEdit").val(''); // inputbox に入力された値を空にする
    }).catch(function (error) { // 失敗した場合に実行される箇所
      console.error("Error removing document: ", error);
    });
}

// タスクの完了、未完了を制御する
function check(elm) {
  db.collection("tasks").doc(elm.getAttribute('value'))
    .update({ // elm.getAttribute('value') で削除する対象データのIDを取得し、そのデータに対して更新を行う
      done: elm.checked, // 対象要素のチェック状態
    }).then(function () { // 成功した場合に実行される箇所
      console.log("Document successfully updated!");
    }).catch(function (error) { // 失敗した場合に実行される箇所
      console.error("Error removing document: ", error);
    });
}

// タスク更新のためのモーダルを表示する
function showEditModal(elm) {
  $('#docId').val(elm.getAttribute('value')); // 選択したタスクデータのID を <input type="hidden" id="docId"> に設定
  $('#updateBtn').css("display", "inline"); // 更新用のボタンを表示する
  $('#deleteBtn').css("display", "none"); // 削除用のボタンを非表示にする
  $('#taskNameForEdit').css("display", "inline"); // タスク名を入力するための inputbox を表示する
  $('#warningMsg').css("display", "none"); // 削除用の警告メッセージを非表示にする
}

// タスク削除のためのモーダルを表示する
function showDeleteModal(elm) {
  $('#docId').val(elm.getAttribute('value')); // 選択したタスクデータのID を <input type="hidden" id="docId"> に設定
  $('#updateBtn').css("display", "none"); // 更新用のボタンを非表示にする
  $('#deleteBtn').css("display", "inline"); // 削除用のボタンを表示する
  $('#taskNameForEdit').css("display", "none"); // タスク名を入力するための inputbox を非表示にする
  $('#warningMsg').css("display", "inline"); // 削除用の警告メッセージを表示する
}
*/