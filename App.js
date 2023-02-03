import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import * as SQlite from 'expo-sqlite'

export default function App() {

  const db = SQlite.openDatabase('database.db')

  const [input, setInput] = React.useState('')
  const [names, setNames] = React.useState([])

  React.useEffect(() => {
    db.transaction(tx => tx.executeSql(
      'CREATE TABLE IF NOT EXISTS person (name VARCHAR(100) NOT NULL)'
    ))

    db.transaction(tx => tx.executeSql(
      'SELECT rowid, * FROM person',
      null,
      (obj, res) => setNames(res.rows._array),
      (obj, err) => console.error(err)
    ))
  }, [])

  const handleAdd = () => {
    db.transaction(tx => tx.executeSql(
      'INSERT INTO person (name) VALUES (?)', [input],
      (obj, res) => setNames(prev => [...prev, { name: input, rowid: res.insertId }]),
      (obj, err) => console.error(err)
    ))
    setInput('')
  }

  const handleRemove = (id) => {
    db.transaction(tx => tx.executeSql(
      'DELETE FROM person WHERE rowid = ?', [id],
      (obj, res) => {
        console.log(res)
        setNames(prev => prev.filter(item => item.rowid !== id))
      },
      (obj, err) => console.error(err)
    ))
  }

  const handleUpdate = (id) => {
    db.transaction(tx => tx.executeSql(
      'UPDATE person SET name = ? WHERE rowid = ?', [input, id],
      (obj, res) => {
        setNames(prev => prev.map(n => (n.rowid === id ? { ...n, name: input} : n)))
      },
      (obj, err) => console.error(err)
    ))
  }

  const showNames = () => {
    return names.map((n, i) => <View key={i} style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', padding: 32 }}>
      <Text style={{ fontSize: 24 }}>{n.name}</Text>
      <View style={{ flexDirection: 'row' }}>
        <Button title='/' onPress={() => handleUpdate(n.rowid)} />
        <Button title='-' onPress={() => handleRemove(n.rowid)} />
      </View>
    </View>)
  }

  return (
    <View style={styles.container}>
      <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#BBB', borderRadius: 5, padding: 5 }}>
        <TextInput value={input} placeholder='insert name' onChangeText={setInput} />
        <Button title='+' onPress={handleAdd} />
      </View>
      <View style={{ flex: 1, width: '100%' }}>
        {showNames()}
      </View>
      {/* <FlatList /> */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    fontSize: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
