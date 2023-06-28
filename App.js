import 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Button, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { useEffect, useRef, useState } from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons'

function Item({ item, navigation }) {
  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate('Details', { item: item })} style={styles.listItem}>
        <Text style={{ fontSize: 20 }}>{item.todo}</Text>
        <Ionicons name="md-chevron-forward" size={25} color="#4F8EF7" />
      </TouchableOpacity>
    </View>
  )
}

function ItemDone({ item, navigation }) {
  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate('Details', { item: item })} style={styles.listItem}>
        <Text style={{ fontSize: 20, textDecorationLine: 'line-through' }}>{item.todo}</Text>
        <Ionicons name="md-chevron-forward" size={25} color="#4F8EF7" />
      </TouchableOpacity>
    </View>
  )
}

function Home({ route, navigation }) {
  const [todos, setTodos] = useState([])
  const [done, setDone] = useState([])

  let id = useRef(1)

  useEffect(() => {
    if (route.params?.todo) {
      const { title, description, created } = route.params.todo

      const newTodos = [...todos]

      newTodos.push({ todo: title, description: description, created: created, done: false, id: id.current++ })

      navigation.setParams({
        todo: undefined
      })

      setTodos(newTodos)
    }
  }, [route.params?.todo])

  useEffect(() => {

    if (route.params?.toDelete) {
      const toDelete = route.params.toDelete

      if (todos.find(todo => todo.id === toDelete)) {
        const newTodos = todos.filter(todo => todo.id != toDelete)

        setTodos(newTodos)
      } else {
        const newDone = done.filter(item => item.id != toDelete)

        setDone(newDone)
      }
    }
  }, [route.params?.toDelete])

  useEffect(() => {
    if (route.params?.done) {
      const doneId = route.params.done
      const doneItem = todos.filter((todo) => todo.id === doneId)[0]
      doneItem.done = true
      const newDone = [...done]
      newDone.splice(0, 0, doneItem)

      const newTodos = todos.filter(todo => todo.id != doneId)

      setDone(newDone)
      setTodos(newTodos)
    }
  }, [route.params?.done])
  
  useEffect(() => {
    if (route.params?.undo) {
      const undoId = route.params.undo
      const undoItem = done.filter((item) => item.id === undoId)[0]
      undoItem.done = false
      const newTodos = [...todos]
      newTodos.splice(0, 0, undoItem)

      const newDone = done.filter(item => item.id != undoId)

      setDone(newDone)
      setTodos(newTodos)
    }
  }, [route.params?.undo])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <TouchableOpacity style={{ ...styles.button, marginRight: 10 }} onPress={() => navigation.navigate('Add')}><Text style={styles.buttonText}>Add</Text></TouchableOpacity>
    })
  }, [])

  return (
    <View style={{ margin: 10 }}>
      <FlatList data={todos} renderItem={({ item }) => <Item item={item} navigation={navigation} />} keyExtractor={(item) => item.id} />
      <Text style={{ marginVertical: 10, }}>Genomfört:</Text>
      <FlatList data={done} renderItem={({ item }) => <ItemDone item={item} navigation={navigation} />} keyExtractor={(item) => item.id} />
    </View>
  )
}

function Details({ route, navigation }) {

  const { todo, description, created, done, id } = route.params.item

  useEffect(() => {
    navigation.setOptions({ title: todo })
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ fontSize: 20, margin: 20 }}>{description}</Text>
        {!done ? (
          <TouchableOpacity onPress={() => navigation.navigate('Home', { done: id })} style={styles.button}>
            <Text style={{ ...styles.buttonText, fontSize: 20 }}>Klar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Home', { undo: id })} style={styles.button}>
            <Text style={{ ...styles.buttonText, fontSize: 20 }}>Ångra</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderTopColor: 'black', borderTopWidth: 1 }}>
        <Text>Created: {created}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { toDelete: id })}>
          <Ionicons name="trash-outline" size={40} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

function Add({ route, navigation }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 10, margin: 40 }}>
      <TextInput onChangeText={setTitle} style={styles.textInput} placeholder='Title' />
      <TextInput onChangeText={setDescription} style={styles.textInput} placeholder='Description' multiline={true} numberOfLines={4} textAlignVertical='top' />
      <TouchableOpacity onPress={() => navigation.navigate('Home', { todo: { title: title, description: description, created: new Date().toLocaleString('sv-SE') } })} style={styles.button}><Text style={{ ...styles.buttonText, fontSize: 20 }}>Add Todo</Text></TouchableOpacity>
    </View>
  )
}

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home' screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name='Home' component={Home} options={{ title: 'Todos', headerRight: () => <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Add</Text></TouchableOpacity> }} />
        <Stack.Screen name='Details' component={Details} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name='Add' component={Add} options={{ title: 'New Todo', presentation: 'modal', animation: 'fade_from_bottom' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'dodgerblue',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white'
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    width: '100%',
    padding: 6,
    fontSize: 20
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 8
  }
});
