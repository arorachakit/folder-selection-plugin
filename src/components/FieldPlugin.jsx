import { useEffect, useState } from 'react'
import { useFieldPlugin } from '@storyblok/field-plugin/react'

import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'

import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText'


const FieldPlugin = () => {
  const {
    data,
    actions: { setContent },
  } = useFieldPlugin()

  const [allFolders, setAllFolders] = useState([])
  const [filteredFolders, setFilteredFolders] = useState([])
  const [selectedValues, setSelectedValues] = useState([])
  const [selectOpen, setSelectOpen] = useState(false)


  // Intial content of the plugin
  const inital_value = data.content ? data.content : []

  // Extracting starts_with from options
  const starts_with = data.options.starts_with

  useEffect(() => {

    // Get folders and filter according to starts_with
    const getFoldersAndFilter = async () => {

      // Using space token
      const token = data.token

      // Fetch all links
      let response = await fetch(`https://api.storyblok.com/v2/cdn/links/?token=${token}`, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })

      const all_links = await response.json()

      // Filter Folders
      let folders = Object.values(all_links.links).filter(l => l.is_folder)
      setAllFolders(() => folders)

      // Filter from starts_with option for dropdown
      let filtered = folders.filter(f => f.slug.startsWith(starts_with)).map(f => (

        // Storing id, name, slug, uuid
        {
          id: f.id,
          name: f.name,
          slug: f.slug,
          uuid: f.uuid
        }
      ))
      
      setFilteredFolders(() => filtered)

      setSelectedValues(() => filtered.filter(f => inital_value.some(c => c.id == f.id)))

    }
    getFoldersAndFilter()
  }, [])

  // On input change set the value of select field and content of the plugin
  const  handleChange =  (event) => {
    const {
      target: { value },
    } = event;

    setSelectedValues(value);
    setContent(value)
  }


  return (
    <Box sx={{ minWidth: 120, minHeight: selectOpen ? 250 : 0, background: '#F9F9F9' }}>
      <FormControl fullWidth size="small">
        <Select 
          sx={{background: 'white'}}
          id="folder-select"
          multiple
          value={selectedValues}
          label="Folders"
          onChange={(event) => handleChange(event)}
          renderValue={(selected) => selected.map(f => f.name).join(", ")}
          onOpen={() => setSelectOpen(true)}
          onClose={() => setSelectOpen(false)}
        >
            {filteredFolders.map((folder => (
              // Options disabled if the maximum number (limit) is reached, and if option is not selected
              <MenuItem divider disabled={Number(data.options.maximum) ? selectedValues.length >= Number(data.options.maximum) && !selectedValues.map(f => f.id).includes(folder.id) : false} dense key={folder.id} value={folder}> 
                <Checkbox checked={selectedValues.map(f => f.id).indexOf(folder.id) > -1} />
                <ListItemText primary={folder.name} secondary={folder.slug} />
              </MenuItem>
            )))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default FieldPlugin
