# Notes

reverse engineering typically focuses on redocumenting systems. 

It could be cool to analyze the history of the version control system.
- How many times has author commited
- How many lines have they deleted.
- How many lines have they added.
- How much code churn is there

It would be cool to create different views of the system.
Can i make them more architecturally relevant by filtering away modules that have outgoing edges?
- Filter out external dependencies
- Aggregate along folder level. **Is this not what we already do?**
- Maybe i can set a depth per dependency?
- Output the amount of code in each file. 
- Color modules based on how often they change
