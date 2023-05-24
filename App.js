// 3. 수정 아이콘을 하나 만들어서 유저가 text를 수정할 수 있게 만들기 : text input

import { StatusBar } from "expo-status-bar";
import React, {useState, useEffect} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Pressable
} from "react-native";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const WHERE_KEY = "@whereNavi";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState();
  const [toDos, setToDos] = useState({});

  useEffect(() => { //앱이 시작하자마자 실행
    loadWhere();
    loadToDos();
  }, []);


  const travel = () => {
    setWorking(false);
    AsyncStorage.setItem(WHERE_KEY, 'false')
  }
  const work = () => {
    setWorking(true);
    AsyncStorage.setItem(WHERE_KEY, 'true')
  }

  const onChangeText = (payload) => setText(payload)

  const loadWhere = async () => {
    const w = await AsyncStorage.getItem(WHERE_KEY);
    console.log(w)
    setWorking(w !== null ? (w === 'true') : true);
  }
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    s !== null ? setToDos(JSON.parse(s)) : null;
  };
  const addToDo = async () => {
    if (text === "") {
      return
    }
    //save to do
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, "completed":"false" }
    };
    console.log(newToDos)
    setToDos(newToDos);
    await saveToDo(newToDos);
    setText("");
  }

  const saveToDo = async (toSave) => {
    try {
      const jsonValue = JSON.stringify(toSave)
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue)
    } catch (e) {
      // saving error
    }
  }
  const changeCompleted = async (key) => {
    //change completed
    const newToDos = {...toDos};
    newToDos[key].completed = !newToDos[key].completed;

    setToDos(newToDos);
    await saveToDo(newToDos);
  }

  const deleteToDo = (key) => {
    Alert.alert("Delete To Do?", "Are you sure?",
      [
        {text: "Cancel"},
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos }
            delete newToDos[key]
            setToDos(newToDos);
            saveToDo(newToDos);
          }
        }
      ]
    );
    return;
    
  };

  

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        value={text} 
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        onChangeText={onChangeText}
        onSubmitEditing={addToDo}
        returnKeyType="done"
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <View style={styles.section}>
                <Pressable
                  style={[styles.checkboxBase, toDos[key].completed && styles.checkboxChecked]}
                  onPress={() => changeCompleted(key)} checked={toDos[key].completed}>
                  {toDos[key].completed ? <Ionicons name="checkmark" size={19} color="white" /> : null}
                </Pressable>
                <Text style={styles.toDoText} >{toDos[key].text}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,

  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop:100,
  },
  btnText: {
    fontSize: 30,
    fontWeight: "600",
    color: "white"
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 18
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "left"
  },
  checkboxBase: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'coral',
    backgroundColor: 'transparent',
    marginRight: 8
  },
  checkboxChecked: {
    backgroundColor: 'coral',
  },
});


