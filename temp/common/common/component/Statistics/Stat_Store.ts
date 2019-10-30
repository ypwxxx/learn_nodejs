import { createStore} from 'Redux'
import todoApp from './Stat_Reducer'



let store = createStore(todoApp)

export default store;